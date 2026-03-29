import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import NeoButton from "@/components/ui/NeoButton";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

const EventsPage = () => {
  const upcomingEvents = [
    {
      title: "AI/ML Workshop",
      date: "2025-12-15",
      location: "Campus Lab",
      description: "Hands-on workshop covering neural networks and deep learning fundamentals",
      status: "upcoming",
    },
    {
      title: "Web Dev Hackathon",
      date: "2025-12-20",
      location: "Online",
      description: "24-hour hackathon to build innovative web applications",
      status: "upcoming",
    },
  ];

  const pastEvents = [
    {
      title: "IoT Bootcamp",
      date: "2025-11-10",
      location: "Campus",
      description: "Introduction to IoT devices and sensor programming",
      status: "completed",
    },
  ];

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

          <div className="space-y-16">
            {/* Upcoming Events */}
            <section className="space-y-8">
              <h2 className="text-3xl font-bold">Upcoming Events</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {upcomingEvents.map((event, index) => (
                  <Card
                    key={event.title}
                    className="p-8 hover:shadow-xl transition-all duration-300 animate-slide-up border-border/40"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-2xl font-semibold">{event.title}</h3>
                        <Badge className="gradient-bg text-white rounded-full">
                          {event.status}
                        </Badge>
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
                      <NeoButton text="Register Now" className="w-full flex justify-center mt-4" />
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Past Events */}
            <section className="space-y-8">
              <h2 className="text-3xl font-bold">Past Events</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {pastEvents.map((event, index) => (
                  <Card
                    key={event.title}
                    className="p-8 opacity-75 hover:opacity-100 transition-all duration-300 animate-slide-up border-border/40"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-2xl font-semibold">{event.title}</h3>
                        <Badge variant="secondary" className="rounded-full">
                          {event.status}
                        </Badge>
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
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;
