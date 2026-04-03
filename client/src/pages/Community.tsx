import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Github, Linkedin, Mail, MapPin, User, Briefcase, Edit2, Trash2, Plus, Upload, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { membersAPI } from "@/lib/api";

const CommunityPage = () => {

  function resizeUrl(url, size = 128) {
    if (!url || url === "Not Uploaded") return "";
    
    // For Cloudinary URLs, apply transformation
    if (url.includes('cloudinary')) {
      return url.replace("/upload/", `/upload/c_fill,h_${size},w_${size},g_face,q_auto,f_auto/`);
    }
    
    // For local uploads, prefix with API base URL if not already a full URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `${apiBaseUrl}${url.startsWith('/') ? url : '/' + url}`;
    }
    
    // Return as-is for full URLs
    return url;
  }

  const { isAuthenticated } = useAuth();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [communityLeads, setCommunityLeads] = useState([]);
  const [domainLeads, setDomainLeads] = useState([]);
  const [coreMembers, setCoreMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberType, setMemberType] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Edit states
  const [editingMember, setEditingMember] = useState(null);
  const [editingMemberType, setEditingMemberType] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addCategoryType, setAddCategoryType] = useState(null);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string>('');
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editSelectedFilePreview, setEditSelectedFilePreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    about: '',
    domain: '',
    position: '',
    city: '',
    country: '',
    github: '',
    linkedin: '',
    insta: '',
  });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/members?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      const members = data.members || [];

      setCommunityLeads(members.filter(m => m.category === 'community leads'));
      setDomainLeads(members.filter(m => m.category === 'domain lead'));
      setCoreMembers(members.filter(m => m.category === 'core members'));
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // const domainLeads = [
  //   { domain: "AI/ML", lead: "Alice Johnson", initials: "AJ" },
  //   { domain: "Web Dev", lead: "Bob Williams", initials: "BW" },
  //   { domain: "App Dev", lead: "Carol Brown", initials: "CB" },
  //   { domain: "Cloud", lead: "David Miller", initials: "DM" },
  //   { domain: "IoT", lead: "Eve Davis", initials: "ED" },
  //   { domain: "Blockchain", lead: "Frank Wilson", initials: "FW" },
  // ];

  const handleMemberClick = (member, type) => {
    setSelectedMember(member);
    setMemberType(type);
    setIsDialogOpen(true);
  };

  const handleEditClick = (member, type) => {
    setEditingMember(member);
    setEditingMemberType(type);
    setEditSelectedFile(null);
    setEditSelectedFilePreview(resizeUrl(member.pfp, 200));
    setFormData({
      name: member.name,
      email: member.email,
      about: member.about || '',
      domain: member.domain || '',
      position: member.position || '',
      city: member.city || '',
      country: member.country || '',
      github: member.github || '',
      linkedin: member.linkedin || '',
      insta: member.insta || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleAddClick = (type) => {
    setAddCategoryType(type);
    setSelectedFile(null);
    setSelectedFilePreview('');
    setFormData({
      name: '',
      email: '',
      about: '',
      domain: '',
      position: '',
      city: '',
      country: '',
      github: '',
      linkedin: '',
      insta: '',
    });
    setIsAddDialogOpen(true);
  };

  // Handle file selection for add form
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file selection for edit form
  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditSelectedFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear file selection
  const clearFileSelection = () => {
    setSelectedFile(null);
    setSelectedFilePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear edit file selection
  const clearEditFileSelection = () => {
    setEditSelectedFile(null);
    setEditSelectedFilePreview(resizeUrl(editingMember?.pfp, 200));
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editingMemberType) return;
    
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('about', formData.about || '');
      formDataToSend.append('domain', formData.domain || '');
      formDataToSend.append('position', formData.position || '');
      formDataToSend.append('city', formData.city || '');
      formDataToSend.append('country', formData.country || '');
      formDataToSend.append('github', formData.github || '');
      formDataToSend.append('linkedin', formData.linkedin || '');
      formDataToSend.append('insta', formData.insta || '');
      
      // Add file if selected
      if (editSelectedFile) {
        formDataToSend.append('pfp', editSelectedFile);
      }

      const response = await membersAPI.update(editingMember.id, formDataToSend);

      if (response.status === 200) {
        setIsEditDialogOpen(false);
        setEditingMember(null);
        clearEditFileSelection();
        await fetchMembers();
      }
    } catch (err) {
      console.error('Error updating member:', err);
      alert('Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCategoryType) return;
    
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('about', formData.about || '');
      formDataToSend.append('domain', formData.domain || '');
      formDataToSend.append('position', formData.position || '');
      formDataToSend.append('city', formData.city || '');
      formDataToSend.append('country', formData.country || '');
      formDataToSend.append('github', formData.github || '');
      formDataToSend.append('linkedin', formData.linkedin || '');
      formDataToSend.append('insta', formData.insta || '');
      formDataToSend.append('category', addCategoryType);
      formDataToSend.append('approvalStatus', 'approved');
      
      // Add file if selected
      if (selectedFile) {
        formDataToSend.append('pfp', selectedFile);
      }

      const response = await membersAPI.create(formDataToSend);

      if (response.status === 201) {
        setIsAddDialogOpen(false);
        setAddCategoryType(null);
        clearFileSelection();
        await fetchMembers();
      }
    } catch (err: any) {
      console.error('Error creating member:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create member';
      const errorDetails = err.response?.data?.details;
      
      if (errorDetails && errorDetails.length > 0) {
        const detailsText = errorDetails.map((d: any) => `${d.field}: ${d.message}`).join('\n');
        alert(`Failed to create member:\n${errorMessage}\n\nDetails:\n${detailsText}`);
      } else {
        alert(`Failed to create member: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;

    try {
      await membersAPI.delete(id);
      await fetchMembers();
    } catch (err) {
      console.error('Error deleting member:', err);
      alert('Failed to delete member');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Our <span className="gradient-text">Community</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the people behind CtrlZ
            </p>
          </div>

          <div className="space-y-16">

            <section className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Community Leads</h2>
                {isAuthenticated && (
                  <Button 
                    onClick={() => handleAddClick('community leads')} 
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Lead
                  </Button>
                )}
              </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-8 border-border/40">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : communityLeads.length === 0 ? (
                <Card className="p-12 text-center border-border/40">
                  <p className="text-lg text-muted-foreground">
                    No community leads found.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {communityLeads.map((lead, index) => (
                    <Card
                      key={lead.id || lead.email || index}
                      className="p-8 hover:shadow-lg transition-all duration-300 animate-slide-up border-border/40 cursor-pointer relative group"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleMemberClick(lead, 'communityLead')}
                    >
                      {isAuthenticated && (
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(lead, 'communityLead');
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(lead.id, 'communityLead');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={resizeUrl(lead.pfp)} alt={lead.name} />
                          <AvatarFallback>{lead.name}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">{lead.name}</h3>
                          <p className="text-accent mb-3">{lead.position}</p>
                          <p className="text-muted-foreground">{lead.about}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>


            <section className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Domain Leads</h2>
                {isAuthenticated && (
                  <Button 
                    onClick={() => handleAddClick('domain lead')} 
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Lead
                  </Button>
                )}
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="p-6 border-border/40">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : domainLeads.length === 0 ? (
                <Card className="p-12 text-center border-border/40">
                  <p className="text-lg text-muted-foreground">
                    No domain leads found.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {domainLeads.map((item, index) => (
                    <Card
                      key={item.id || item.email || index}
                      className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-up border-border/40 cursor-pointer relative group"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleMemberClick(item, 'domainLead')}
                    >
                      {isAuthenticated && (
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(item, 'domainLead');
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id, 'domainLead');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={resizeUrl(item.pfp)} alt={item.name} />
                          <AvatarFallback className="gradient-bg text-white">
                            {item.name || item.lead}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg">{item.lead || item.name}</p>
                          <p className="text-sm text-accent">{item.domain}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Core Members</h2>
                {isAuthenticated && (
                  <Button 
                    onClick={() => handleAddClick('core members')} 
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Member
                  </Button>
                )}
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="p-6 border-border/40">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : coreMembers.length === 0 ? (
                <Card className="p-12 text-center border-border/40">
                  <p className="text-lg text-muted-foreground">
                    No core members found.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coreMembers.map((item, index) => (
                    <Card
                      key={item.id || item.email || index}
                      className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-up border-border/40 cursor-pointer relative group"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleMemberClick(item, 'coreMember')}
                    >
                      {isAuthenticated && (
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(item, 'coreMember');
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id, 'coreMember');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={resizeUrl(item.pfp)} alt={item.name} />
                          <AvatarFallback className="gradient-bg text-white">
                            {item.name}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg">{item.name}</p>
                          <p className="text-sm text-accent">{item.domain || item.position}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />

      {/* Member Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">
                  {selectedMember.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex flex-col items-center space-y-6 py-4">
                {/* Highlighted Photo */}
                <div className="relative">
                  <Avatar className="h-48 w-48 border-4 border-accent/20 shadow-xl">
                    <AvatarImage 
                      src={resizeUrl(selectedMember.pfp, 400)} 
                      alt={selectedMember.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl">
                      {selectedMember.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Information */}
                <div className="w-full space-y-4">
                  {/* Position or Domain */}
                  {(selectedMember.position || selectedMember.domain) && (
                    <div className="flex items-center justify-center space-x-2 text-accent">
                      <Briefcase className="h-5 w-5" />
                      <p className="text-lg font-semibold">
                        {selectedMember.position || selectedMember.domain}
                      </p>
                    </div>
                  )}

                  {/* Email */}
                  {selectedMember.email && (
                    <div className="flex items-center justify-center space-x-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={`mailto:${selectedMember.email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedMember.email}
                      </a>
                    </div>
                  )}

                  {/* About */}
                  {selectedMember.about && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedMember.about}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  {(selectedMember.city || selectedMember.country) && (
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <p>
                        {[selectedMember.city, selectedMember.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Social Media Links */}
                  <div className="flex items-center justify-center space-x-4 pt-4 border-t border-border/40">
                    {selectedMember.github && (
                      <a
                        href={selectedMember.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="GitHub"
                      >
                        <Github className="h-6 w-6" />
                      </a>
                    )}
                    {selectedMember.linkedin && (
                      <a
                        href={selectedMember.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-6 w-6" />
                      </a>
                    )}
                    {selectedMember.insta && (
                      <a
                        href={selectedMember.insta}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Instagram"
                      >
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Member Information</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Profile Picture Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-accent transition-colors"
                      onClick={() => editFileInputRef.current?.click()}
                    >
                      {editSelectedFilePreview ? (
                        <div className="space-y-2">
                          <img src={editSelectedFilePreview} alt="Preview" className="h-32 w-32 object-cover rounded mx-auto" />
                          <p className="text-sm text-muted-foreground">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload image</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEditFileSelect}
                      className="hidden"
                    />
                  </div>
                  {editSelectedFilePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearEditFileSelection}
                      className="mt-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">About</label>
                <Input
                  value={formData.about}
                  onChange={(e) =>
                    setFormData({ ...formData, about: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Domain/Position</label>
                <Input
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">GitHub URL</label>
                <Input
                  value={formData.github}
                  onChange={(e) =>
                    setFormData({ ...formData, github: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Instagram URL</label>
                <Input
                  value={formData.insta}
                  onChange={(e) =>
                    setFormData({ ...formData, insta: e.target.value })
                  }
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Updating...' : 'Update Member'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {/* Profile Picture Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Picture</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-accent transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFilePreview ? (
                      <div className="space-y-2">
                        <img src={selectedFilePreview} alt="Preview" className="h-32 w-32 object-cover rounded mx-auto" />
                        <p className="text-sm text-muted-foreground">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload image</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                {selectedFilePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFileSelection}
                    className="mt-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">About</label>
              <Input
                value={formData.about}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
                placeholder="Brief bio"
              />
            </div>
            {addCategoryType === 'community leads' && (
              <div>
                <label className="text-sm font-medium">Position</label>
                <Input
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder="e.g., President, Vice President"
                />
              </div>
            )}
            {(addCategoryType === 'domain lead' || addCategoryType === 'core members') && (
              <div>
                <label className="text-sm font-medium">Domain</label>
                <Input
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                  placeholder="e.g., AI/ML, Web Dev"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">City</label>
              <Input
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="City"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <Input
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="Country"
              />
            </div>
            <div>
              <label className="text-sm font-medium">GitHub URL</label>
              <Input
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="text-sm font-medium">LinkedIn URL</label>
              <Input
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin: e.target.value })
                }
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Instagram URL</label>
              <Input
                value={formData.insta}
                onChange={(e) =>
                  setFormData({ ...formData, insta: e.target.value })
                }
                placeholder="https://instagram.com/username"
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityPage;
