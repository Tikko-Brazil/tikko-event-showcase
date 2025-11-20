import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, ArrowLeft } from "lucide-react";
import logoLight from "@/assets/logoLight.png";

const Contact = () => {
  const { t } = useTranslation();

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
                {t("contact.header.backToHome")}
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
              {t("contact.hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t("contact.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 max-w-6xl mx-auto">
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto"> */}
            {/* Contact Form */}
            {false &&
              <Card className="gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-2xl">{t("contact.form.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("contact.form.name.label")}</Label>
                      <Input
                        id="name"
                        placeholder={t("contact.form.name.placeholder")}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("contact.form.email.label")}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("contact.form.email.placeholder")}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t("contact.form.subject.label")}</Label>
                      <Input
                        id="subject"
                        placeholder={t("contact.form.subject.placeholder")}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t("contact.form.message.label")}</Label>
                      <Textarea
                        id="message"
                        placeholder={t("contact.form.message.placeholder")}
                        rows={6}
                        className="bg-background/50"
                      />
                    </div>
                    <Button className="w-full gradient-button hover:shadow-elegant transition-smooth">
                      {t("contact.form.button")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            }

            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  {t("contact.info.title")}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t("contact.info.subtitle")}
                </p>
              </div>

              <Card className="gradient-card hover:shadow-elegant transition-smooth">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t("contact.info.email.title")}</h3>
                      <p className="text-sm text-muted-foreground">
                        contato@tikko.com
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
                      <h3 className="font-semibold mb-1">{t("contact.info.phone.title")}</h3>
                      <p className="text-sm text-muted-foreground">
                        +55 (47) 9712-1190
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("contact.info.phone.hours")}
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
                      <h3 className="font-semibold mb-1">{t("contact.info.office.title")}</h3>
                      <p className="text-sm text-muted-foreground">
                        Av. Paulista, 1106, Sala 01, Andar 16
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Bela Vista, São Paulo-SP - 01.310.914
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
          <p>&copy; 2025 Tikko. {t("contact.footer.rights")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
