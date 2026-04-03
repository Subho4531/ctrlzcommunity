import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { membersAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import AddItemModal, { FormField } from "@/components/AddItemModal";

interface Member {
  id: string;
  name: string;
  email: string;
  year?: string;
  domain?: string;
  approvalStatus?: string;
  category?: string;
  pfp?: string;
}

const MembersGridPage = () => {
  const { isAuthenticated } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const addMemberFields: FormField[] = [
    { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter member name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'member@example.com' },
    { name: 'year', label: 'Year (Optional)', type: 'number', required: false, placeholder: '2024' },
    { name: 'domain', label: 'Domain (Optional)', type: 'text', required: false, placeholder: 'e.g., AI/ML, Web Dev' },
    { name: 'category', label: 'Category', type: 'select', required: false, options: [
      { label: 'Core Members', value: 'core members' },
      { label: 'Domain Lead', value: 'domain lead' },
      { label: 'Community Leads', value: 'community leads' }
    ]},
    { name: 'pfp', label: 'Profile Picture', type: 'file', required: false },
    { name: 'approvalStatus', label: 'Status', type: 'select', required: false, options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' }
    ]},
  ];

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await membersAPI.getAll();
      setMembers(response.data || []);
      setFilteredMembers(response.data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter((member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const handleAddMemberSubmit = async (fd: FormData) => {
    try {
      const name = fd.get('name') as string;
      const email = fd.get('email') as string;
      const year = fd.get('year') as string;
      const domain = fd.get('domain') as string;
      const category = (fd.get('category') as string) || 'core members';
      const pfp = fd.get('pfp') as File | null;
      const approvalStatus = (fd.get('approvalStatus') as string) || 'pending';

      // Create new FormData for the request to include file
      const requestData = new FormData();
      requestData.append('name', name);
      requestData.append('email', email);
      if (year) requestData.append('year', year);
      if (domain) requestData.append('domain', domain);
      requestData.append('category', category);
      if (pfp) requestData.append('pfp', pfp);
      requestData.append('approvalStatus', approvalStatus);

      //Call API with FormData
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/members/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: requestData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create member');
      }

      setIsAddModalOpen(false);
      await fetchMembers();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create member');
    }
  };

  const handleEditMemberSubmit = async (fd: FormData) => {
    if (!editingMember) return;
    try {
      const requestData = new FormData();
      const name = fd.get('name') as string;
      const email = fd.get('email') as string;
      const year = fd.get('year') as string;
      const domain = fd.get('domain') as string;
      const category = (fd.get('category') as string) || 'core members';
      const pfp = fd.get('pfp') as File | null;
      const approvalStatus = (fd.get('approvalStatus') as string) || 'pending';

      if (name) requestData.append('name', name);
      if (email) requestData.append('email', email);
      if (year) requestData.append('year', year);
      if (domain) requestData.append('domain', domain);
      requestData.append('category', category);
      if (pfp) requestData.append('pfp', pfp);
      if (approvalStatus) requestData.append('approvalStatus', approvalStatus);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: requestData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update member');
      }

      setIsEditModalOpen(false);
      setEditingMember(null);
      await fetchMembers();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update member');
    }
  };

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/members/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      await fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Member <span className="gradient-text">Directory</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Browse our community of innovators and creators
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-8 text-center">
              {error}
            </div>
          )}

          {/* Search and Filter with Add Button */}
          <div className="mb-12 flex flex-col sm:flex-row gap-4 items-center max-w-4xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, or domain..."
                className="pl-12 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isAuthenticated && (
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <p className="text-center text-muted-foreground">No members found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMembers.map((member, index) => (
                <Card
                  key={member.id}
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up border-border/40 group relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {isAuthenticated && (
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditClick(member)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-24 w-24 group-hover:scale-110 transition-transform border-2">
                      {member.pfp && <AvatarImage src={member.pfp} alt={member.name} />}
                      <AvatarFallback className="text-xl gradient-bg text-white">
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{member.email}</p>
                      {member.domain && (
                        <Badge variant="secondary" className="text-xs mr-1">
                          {member.domain}
                        </Badge>
                      )}
                      {member.category && (
                        <Badge variant="outline" className="text-xs">
                          {member.category}
                        </Badge>
                      )}
                    </div>
                    {member.approvalStatus && (
                      <Badge
                        variant={member.approvalStatus === 'approved' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {member.approvalStatus}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Member Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        title="Add New Member"
        description="Add a new member to the directory"
        fields={addMemberFields}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMemberSubmit}
        imageFieldName="pfp"
      />

      {/* Edit Member Modal */}
      {editingMember && (
        <AddItemModal
          isOpen={isEditModalOpen}
          title="Edit Member"
          description="Update member information"
          fields={addMemberFields.map(field => ({
            ...field,
            defaultValue: field.name === 'name' ? editingMember.name :
                         field.name === 'email' ? editingMember.email :
                         field.name === 'year' ? editingMember.year :
                         field.name === 'domain' ? editingMember.domain :
                         field.name === 'category' ? editingMember.category :
                         field.name === 'approvalStatus' ? editingMember.approvalStatus :
                         undefined
          }))}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingMember(null);
          }}
          onSubmit={handleEditMemberSubmit}
          imageFieldName="pfp"
        />
      )}

      <Footer />
    </div>
  );
};

export default MembersGridPage;
