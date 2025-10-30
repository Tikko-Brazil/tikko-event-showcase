import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, ArrowLeft } from "lucide-react";
import logoLight from "@/assets/logoLight.png";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-4">
              <img src={logoLight} alt="Tikko" className="h-8" />
            </Link>
            <Link to="/">
              <Button variant="ghost" className="transition-smooth">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Have questions or feedback? We'd love to hear from you. Our team is here to help make your event experience amazing.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more..."
                      rows={6}
                      className="bg-background/50"
                    />
                  </div>
                  <Button className="w-full gradient-button hover:shadow-elegant transition-smooth">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Contact <span className="text-primary">Information</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Reach out through any of these channels and we'll get back to you as soon as possible.
                </p>
              </div>

              <Card className="gradient-card hover:shadow-elegant transition-smooth">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        support@tikko.com
                      </p>
                      <p className="text-sm text-muted-foreground">
                        business@tikko.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card hover:shadow-elegant transition-smooth">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-sm text-muted-foreground">
                        +1 (555) 123-4567
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Mon-Fri, 9am-6pm EST
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card hover:shadow-elegant transition-smooth">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Office</h3>
                      <p className="text-sm text-muted-foreground">
                        123 Event Street, Suite 456
                      </p>
                      <p className="text-sm text-muted-foreground">
                        San Francisco, CA 94102
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Tikko. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
