import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import NeoButton from "@/components/ui/NeoButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { contactAPI } from "@/lib/api";
import { Mail, MapPin, Phone } from "lucide-react";

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Validate subject length
      if (formData.subject.length < 5 || formData.subject.length > 200) {
        setError("Subject must be between 5 and 200 characters");
        setIsSubmitting(false);
        return;
      }

      // Validate message length
      if (formData.message.length < 10 || formData.message.length > 1000) {
        setError("Message must be between 10 and 1000 characters");
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      await contactAPI.submit(formData);

      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
      console.error('Error submitting contact form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "hello@ctrlz.tech",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "University Campus",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="lg:col-span-2 p-8 md:p-12 animate-slide-up border-border/40">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      required
                      disabled={isSubmitting}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="rounded-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject * (5-200 characters)</Label>
                  <Input
                    id="subject"
                    required
                    disabled={isSubmitting}
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="rounded-full"
                  />
                  <p className="text-xs text-gray-500">{formData.subject.length}/200</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message * (10-1000 characters)</Label>
                  <Textarea
                    id="message"
                    required
                    disabled={isSubmitting}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">{formData.message.length}/1000</p>
                </div>

                <NeoButton type="submit" text={isSubmitting ? "Sending..." : "Send Message"} disabled={isSubmitting} className="w-full flex justify-center text-lg mt-4" />
              </form>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
              {contactInfo.map((info) => (
                <Card
                  key={info.label}
                  className="p-6 hover:shadow-lg transition-all duration-300 border-border/40"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full gradient-bg">
                      <info.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{info.label}</h3>
                      <p className="text-muted-foreground">{info.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
