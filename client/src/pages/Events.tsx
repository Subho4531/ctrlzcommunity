import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NeoButton from "@/components/ui/NeoButton";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Edit2, Trash2, X, Plus } from "lucide-react";
import { eventsAPI, Event } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import AddItemModal, { FormField } from "@/components/AddItemModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    status: 'upcoming' as 'upcoming' | 'completed',
    registrationLink: '',
    capacity: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addEventFields: FormField[] = [
    { name: 'title', label: 'Event Title', type: 'text', required: true, placeholder: 'Enter event name' },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true, placeholder: 'e.g., Online / Delhi' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Event details and agenda' },
    { name: 'capacity', label: 'Capacity (optional)', type: 'number', required: false, placeholder: 'Max attendees' },
    { name: 'registrationLink', label: 'Registration Link', type: 'url', required: false, placeholder: 'https://forms.google.com/...' },
    { name: 'status', label: 'Status', type: 'select', required: false, options: [
      { label: 'Upcoming', value: 'upcoming' },
      { label: 'Completed', value: 'completed' }
    ]},
  ];

  const handleAddEventSubmit = async (fd: FormData) => {
    try {
      const title = fd.get('title') as string;
      const date = fd.get('date') as string;
      const location = fd.get('location') as string;
      const description = fd.get('description') as string;
      const registrationLink = fd.get('registrationLink') as string;
      const capacity = fd.get('capacity') as string;
      const status = (fd.get('status') as string) || 'upcoming';

      await eventsAPI.create({
        title,
        date,
        location,
        description,
        registrationLink: registrationLink || undefined,
        capacity: capacity ? parseInt(capacity) : undefined,
        status: status as 'upcoming' | 'completed',
      });

      setIsAddModalOpen(false);
      await fetchEvents();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create event');
    }
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const upcomingResponse = await eventsAPI.getAll({ status: 'upcoming' });
      const pastResponse = await eventsAPI.getAll({ status: 'completed' });
      
      setUpcomingEvents(upcomingResponse.data || []);
      setPastEvents(pastResponse.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      location: event.location,
      description: event.description,
      status: event.status,
      registrationLink: event.registrationLink || '',
      capacity: event.capacity?.toString() || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingEvent) {
        await eventsAPI.update(editingEvent.id, {
          title: formData.title,
          date: formData.date,
          location: formData.location,
          description: formData.description,
          status: formData.status,
          registrationLink: formData.registrationLink || undefined,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        });
      }

      await fetchEvents();
      setEditingEvent(null);
      setFormData({
        title: '',
        date: '',
        location: '',
        description: '',
        status: 'upcoming',
        registrationLink: '',
        capacity: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventsAPI.delete(id);
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Our <span className="gradient-text">Events</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join us for workshops, hackathons, and community gatherings
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-8 text-center">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Upcoming Events */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Upcoming Events</h2>
                  {isAuthenticated && (
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Event
                    </Button>
                  )}
                </div>
                {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
                  <p className="text-muted-foreground">No events scheduled yet.</p>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-muted-foreground">No upcoming events scheduled.</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {upcomingEvents.map((event, index) => (
                      <Card
                        key={event.id}
                        className="p-8 hover:shadow-xl transition-all duration-300 animate-slide-up border-border/40 relative group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <h3 className="text-2xl font-semibold">{event.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge className="gradient-bg text-white rounded-full">
                                {event.status}
                              </Badge>
                              {isAuthenticated && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditClick(event)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Edit Event</DialogTitle>
                                        <DialogDescription>Update event details</DialogDescription>
                                      </DialogHeader>
                                      <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                          <label className="text-sm font-medium">Title</label>
                                          <Input
                                            value={formData.title}
                                            onChange={(e) =>
                                              setFormData({ ...formData, title: e.target.value })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Date</label>
                                          <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) =>
                                              setFormData({ ...formData, date: e.target.value })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Location</label>
                                          <Input
                                            value={formData.location}
                                            onChange={(e) =>
                                              setFormData({ ...formData, location: e.target.value })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Description</label>
                                          <Input
                                            value={formData.description}
                                            onChange={(e) =>
                                              setFormData({ ...formData, description: e.target.value })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Status</label>
                                          <select
                                            value={formData.status}
                                            onChange={(e) =>
                                              setFormData({
                                                ...formData,
                                                status: e.target.value as 'upcoming' | 'completed',
                                              })
                                            }
                                            className="w-full px-3 py-2 border rounded-md"
                                          >
                                            <option value="upcoming">Upcoming</option>
                                            <option value="completed">Completed</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Registration Link</label>
                                          <Input
                                            value={formData.registrationLink}
                                            onChange={(e) =>
                                              setFormData({
                                                ...formData,
                                                registrationLink: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Capacity</label>
                                          <Input
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) =>
                                              setFormData({ ...formData, capacity: e.target.value })
                                            }
                                          />
                                        </div>
                                        <Button type="submit" disabled={isSubmitting} className="w-full">
                                          {isSubmitting ? 'Updating...' : 'Update Event'}
                                        </Button>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(event.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{event.description}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          {event.registrationLink ? (
                            <a
                              href={event.registrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <NeoButton text="Register Now" className="w-full flex justify-center mt-4" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="w-full px-4 py-2 mt-4 bg-gray-300 text-gray-600 rounded cursor-not-allowed opacity-50"
                            >
                              Registration Link Not Available
                            </button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {/* Past Events */}
              <section className="space-y-8">
                <h2 className="text-3xl font-bold">Past Events</h2>
                {pastEvents.length === 0 ? (
                  <p className="text-muted-foreground">No past events.</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {pastEvents.map((event, index) => (
                      <Card
                        key={event.id}
                        className="p-8 opacity-75 hover:opacity-100 transition-all duration-300 animate-slide-up border-border/40 relative group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <h3 className="text-2xl font-semibold">{event.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="rounded-full">
                                {event.status}
                              </Badge>
                              {isAuthenticated && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditClick(event)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Edit Event</DialogTitle>
                                      </DialogHeader>
                                      <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                          <label className="text-sm font-medium">Title</label>
                                          <Input
                                            value={formData.title}
                                            onChange={(e) =>
                                              setFormData({ ...formData, title: e.target.value })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Date</label>
                                          <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) =>
                                              setFormData({ ...formData, date: e.target.value })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Location</label>
                                          <Input
                                            value={formData.location}
                                            onChange={(e) =>
                                              setFormData({ ...formData, location: e.target.value })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Description</label>
                                          <Input
                                            value={formData.description}
                                            onChange={(e) =>
                                              setFormData({ ...formData, description: e.target.value })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Status</label>
                                          <select
                                            value={formData.status}
                                            onChange={(e) =>
                                              setFormData({
                                                ...formData,
                                                status: e.target.value as 'upcoming' | 'completed',
                                              })
                                            }
                                            className="w-full px-3 py-2 border rounded-md"
                                          >
                                            <option value="upcoming">Upcoming</option>
                                            <option value="completed">Completed</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Registration Link</label>
                                          <Input
                                            value={formData.registrationLink}
                                            onChange={(e) =>
                                              setFormData({
                                                ...formData,
                                                registrationLink: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Capacity</label>
                                          <Input
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) =>
                                              setFormData({ ...formData, capacity: e.target.value })
                                            }
                                          />
                                        </div>
                                        <Button type="submit" disabled={isSubmitting} className="w-full">
                                          {isSubmitting ? 'Updating...' : 'Update Event'}
                                        </Button>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(event.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{event.description}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Add Event Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        title="Create New Event"
        description="Add a new event to the community calendar"
        fields={addEventFields}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEventSubmit}
      />

      <Footer />
    </div>
  );
};

export default EventsPage;
