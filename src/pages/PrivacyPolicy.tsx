import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import logoLight from "@/assets/logoLight.png";

const PrivacyPolicy = () => {
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
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Last updated: January 1, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="prose prose-invert max-w-none space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">1. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We collect several types of information to provide and improve our service to you:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Personal identification information (name, email address, phone number)</li>
                    <li>Payment and billing information</li>
                    <li>Event attendance history and preferences</li>
                    <li>Device and usage information</li>
                    <li>Location data when you use our service</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">2. How We Use Your Information</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Your information is used to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Process ticket purchases and manage your bookings</li>
                    <li>Send you event confirmations, updates, and important notices</li>
                    <li>Personalize your experience and provide relevant event recommendations</li>
                    <li>Improve our platform and develop new features</li>
                    <li>Prevent fraud and maintain platform security</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">3. Information Sharing and Disclosure</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We may share your information with:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Event organizers for events you purchase tickets to</li>
                    <li>Payment processors to facilitate transactions</li>
                    <li>Service providers who assist in operating our platform</li>
                    <li>Law enforcement when required by law</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    We never sell your personal information to third parties for their marketing purposes.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">4. Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures to protect your personal information. This includes encryption of sensitive data, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">5. Cookies and Tracking Technologies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with small amounts of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">6. Your Privacy Rights</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Access, update, or delete your personal information</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request a copy of your data</li>
                    <li>Restrict or object to certain data processing</li>
                    <li>Lodge a complaint with a supervisory authority</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">7. Children's Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our service is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">8. Changes to This Privacy Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">9. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us at privacy@tikko.com or write to us at:
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    Tikko Privacy Team<br />
                    123 Event Street, Suite 456<br />
                    San Francisco, CA 94102
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

export default PrivacyPolicy;
