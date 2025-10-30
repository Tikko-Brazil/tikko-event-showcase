import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import logoLight from "@/assets/logoLight.png";

const TermsOfService = () => {
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
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Last updated: January 1, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="prose prose-invert max-w-none space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Tikko's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">2. Use of Service</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Tikko provides an online platform for event discovery, ticketing, and management. By using our service, you agree to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Provide accurate and complete information when creating an account</li>
                    <li>Maintain the security of your password and account</li>
                    <li>Not use the service for any illegal or unauthorized purpose</li>
                    <li>Comply with all local laws regarding online conduct and acceptable content</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">3. Ticket Purchases</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All ticket sales are final unless the event is canceled or rescheduled. Refund policies are determined by event organizers and will be clearly stated at the time of purchase. Tikko acts as a platform facilitating these transactions but is not responsible for event cancellations or changes.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">4. Event Organizer Responsibilities</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Event organizers using our platform agree to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Provide accurate event information and deliver the promised event experience</li>
                    <li>Handle ticket refunds according to stated policies</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Maintain appropriate insurance coverage for their events</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">5. Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The Tikko platform, including its original content, features, and functionality, is owned by Tikko and is protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">6. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Tikko shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. We do not guarantee that the service will be uninterrupted, secure, or error-free.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">7. Termination</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms of Service.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">8. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify or replace these terms at any time. It is your responsibility to check these Terms periodically for changes. Your continued use of the service following the posting of any changes constitutes acceptance of those changes.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">9. Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about these Terms, please contact us at legal@tikko.com.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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

export default TermsOfService;
