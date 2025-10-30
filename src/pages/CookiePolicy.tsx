import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import logoLight from "@/assets/logoLight.png";

const CookiePolicy = () => {
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
              Cookie Policy
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Last updated: January 1, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="prose prose-invert max-w-none space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">What Are Cookies?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our site, and improving our services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Types of Cookies We Use</h2>
                  
                  <div className="space-y-6 mt-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Essential Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and processing payments. The website cannot function properly without these cookies.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Performance Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the way our website works and provide a better user experience.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Functional Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. Examples include remembering your language preference or login details.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Targeting/Marketing Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        These cookies are used to deliver advertisements more relevant to you and your interests. They also help limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Third-Party Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We work with trusted third-party services that may also set cookies on your device. These include:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Analytics providers (e.g., Google Analytics) to understand site usage</li>
                    <li>Payment processors to facilitate secure transactions</li>
                    <li>Social media platforms for sharing content</li>
                    <li>Advertising networks to display relevant ads</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Managing Your Cookie Preferences</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    You have several options to manage cookies:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Use our cookie consent tool when you first visit the site</li>
                    <li>Adjust your browser settings to block or delete cookies</li>
                    <li>Use browser extensions that manage cookie preferences</li>
                    <li>Opt-out of targeted advertising through industry opt-out pages</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    Please note that blocking certain cookies may affect your experience on our website and limit certain features.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Cookie Duration</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Cookies can be either:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><strong>Session cookies:</strong> Temporary cookies that expire when you close your browser</li>
                    <li><strong>Persistent cookies:</strong> Remain on your device for a set period or until you delete them</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">How to Control Cookies in Your Browser</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Most web browsers allow you to control cookies through their settings. Here's how:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                    <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                    <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Updates to This Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please revisit this page regularly to stay informed about our use of cookies.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about our use of cookies or this Cookie Policy, please contact us at privacy@tikko.com.
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

export default CookiePolicy;
