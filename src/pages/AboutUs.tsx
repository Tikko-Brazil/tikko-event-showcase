import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Award, ArrowLeft } from "lucide-react";
import logoLight from "@/assets/logoLight.png";

const AboutUs = () => {
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
                {t("about.header.backToHome")}
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
              {t("about.hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t("about.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              {t("about.story.title")}
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-muted-foreground mb-4">
                {t("about.story.paragraph1")}
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                {t("about.story.paragraph2")}
              </p>
              <p className="text-lg text-muted-foreground">
                {t("about.story.paragraph3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            {t("about.values.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="gradient-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t("about.values.community.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.values.community.description")}
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
                  <h3 className="font-semibold text-lg mb-2">{t("about.values.innovation.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.values.innovation.description")}
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
                  <h3 className="font-semibold text-lg mb-2">{t("about.values.passion.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.values.passion.description")}
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
                  <h3 className="font-semibold text-lg mb-2">{t("about.values.excellence.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.values.excellence.description")}
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
              {t("about.cta.title")}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("about.cta.subtitle")}
            </p>
            <Link to="/login">
              <Button size="lg" className="h-14 px-8 text-lg gradient-button hover:shadow-elegant transition-bounce">
                {t("about.cta.button")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Tikko. {t("about.footer.rights")}</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
