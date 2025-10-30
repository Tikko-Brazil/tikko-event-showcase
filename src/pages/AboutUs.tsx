import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Award, ArrowLeft } from "lucide-react";
import logoLight from "@/assets/logoLight.png";

const AboutUs = () => {
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
              About Tikko
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're on a mission to transform how people discover, attend, and create memorable experiences through events that bring communities together.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Our <span className="text-primary">Story</span>
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-muted-foreground mb-4">
                Founded in 2024, Tikko emerged from a simple observation: finding and attending great events was unnecessarily complicated. We believed there had to be a better way to connect people with experiences that matter to them.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Today, Tikko serves thousands of event organizers and millions of attendees worldwide, powering everything from intimate workshops to massive music festivals. Our platform combines cutting-edge technology with human-centered design to make event discovery and ticketing seamless.
              </p>
              <p className="text-lg text-muted-foreground">
                But we're more than just a ticketing platform. We're building a community of passionate event-goers, creative organizers, and innovative venues who believe that shared experiences are what make life memorable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Our <span className="text-primary">Values</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="gradient-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Community First</h3>
                  <p className="text-sm text-muted-foreground">
                    We prioritize building meaningful connections and fostering vibrant communities through shared experiences.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Innovation</h3>
                  <p className="text-sm text-muted-foreground">
                    We constantly push boundaries to create better, smarter solutions for event discovery and management.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Passion</h3>
                  <p className="text-sm text-muted-foreground">
                    We're genuinely passionate about events and the magic they create in people's lives.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    We're committed to delivering exceptional experiences for both organizers and attendees.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-background/80" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Join Our Journey
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Be part of a community that's redefining how people experience events.
            </p>
            <Link to="/login">
              <Button size="lg" className="h-14 px-8 text-lg gradient-button hover:shadow-elegant transition-bounce">
                Get Started Today
              </Button>
            </Link>
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

export default AboutUs;
