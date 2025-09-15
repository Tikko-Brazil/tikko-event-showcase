import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Minus, Plus, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import heroImage from '@/assets/hero-event-image.jpg';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  requiresApproval?: boolean;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  organizer: string;
  image: string;
  tickets: TicketType[];
  tags: string[];
}

// Static event data - in a real app, this would come from an API
const eventData: EventData = {
  id: 'colmeia-27',
  title: 'Colmeia',
  description: `Bem-vindo à Colmeia 🐝

Você não compra um ingresso. Você é aceito.

Uma experiência exclusiva onde a música eletrônica encontra a sofisticação. A Colmeia é mais que uma festa, é uma comunidade seletiva de amantes da música eletrônica de qualidade.

Nossa proposta é criar um ambiente intimista e elegante, onde cada participante faz parte de algo especial. Com sistema de aprovação para garantir a qualidade da experiência, oferecemos diferentes níveis de acesso para você viver a noite do seu jeito.

✨ Line-up cuidadosamente selecionado
🎵 Som de alta qualidade em ambiente acústico premium  
🥂 Bar premium com drinks autorais
🔒 Ambiente exclusivo e seguro
👥 Networking com pessoas que compartilham sua paixão pela música

Prepare-se para uma noite inesquecível.`,
  date: 'Sábado, 25 de outubro de 2025',
  time: '23:00 - 07:00',
  venue: 'Sala 528 (Anexo ao Greenvalley)',
  address: 'Rua Antônio Lopes Gonçalves Bastos, Rio Pequeno, Camboriú - Santa Catarina',
  organizer: 'Tikko Events',
  image: heroImage,
  tickets: [
    {
      id: 'frontstage-m',
      name: 'Frontstage Masculino - Pré-venda',
      price: 70,
      requiresApproval: true
    },
    {
      id: 'frontstage-f',
      name: 'Frontstage Feminino - Pré-venda',
      price: 40,
      requiresApproval: true
    },
    {
      id: 'backstage-m',
      name: 'Backstage Masculino - Pré-venda',
      price: 210,
      requiresApproval: true
    },
    {
      id: 'backstage-f',
      name: 'Backstage Feminino - Pré-venda',
      price: 160,
      requiresApproval: true
    }
  ],
  tags: ['Música Eletrônica', 'Festa Exclusiva', 'Requer Aprovação', 'Camboriú']
};

export default function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [event, setEvent] = useState<EventData | null>(null);

  useEffect(() => {
    // In a real app, you would fetch event data based on eventId
    // For now, we'll use the static data
    setEvent(eventData);
    
    // Set SEO meta tags dynamically
    document.title = `${eventData.title} - Tikko`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `${eventData.title} - ${eventData.date} em ${eventData.venue}. ${eventData.description.substring(0, 160)}...`);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (ogTitle) ogTitle.setAttribute('content', `${eventData.title} - Tikko`);
    if (ogDescription) ogDescription.setAttribute('content', `${eventData.title} - ${eventData.date} em ${eventData.venue}`);
    if (ogImage) ogImage.setAttribute('content', eventData.image);
  }, [eventId]);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Evento não encontrado</h2>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos eventos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedTicketData = event.tickets.find(t => t.id === selectedTicket);
  const totalPrice = selectedTicketData ? selectedTicketData.price * quantity : 0;

  const adjustQuantity = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${event.title} - Tikko`,
      text: `${event.title} - ${event.date} em ${event.venue}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
      } catch (err) {
        console.log('Error copying to clipboard:', err);
        // Final fallback: show URL in alert
        alert(`Compartilhe este link: ${window.location.href}`);
      }
    }
  };

  const openGoogleMaps = () => {
    const address = encodeURIComponent(`${event.venue}, ${event.address}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Bar with Back Button and Share */}
      <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos eventos
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleShare}
            className="text-muted-foreground hover:text-foreground"
            title="Compartilhar evento"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background"></div>
        </div>
        
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-8 md:pb-12">
            <div className="max-w-4xl">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4">
                {event.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-lg">{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-lg">{event.time}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Location Section */}
        <Card className="bg-tikko-card-light text-gray-900 shadow-lg mb-6 md:mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <MapPin className="w-5 h-5 text-tikko-orange mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-lg text-gray-900">{event.venue}</p>
                  <p className="text-gray-600">{event.address}</p>
                  <p className="text-sm text-gray-500 mt-1">Organizado por {event.organizer}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={openGoogleMaps}
                className="text-tikko-orange hover:text-tikko-orange hover:bg-tikko-orange/10 flex-shrink-0"
                title="Ver no Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Ticket Selection Section */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <Card className="bg-card shadow-lg lg:sticky lg:top-24">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Obter ingressos</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Por favor, escolha o tipo de ingresso desejado:
                </p>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
                <RadioGroup
                  value={selectedTicket}
                  onValueChange={setSelectedTicket}
                  className="space-y-3"
                >
                  {event.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`border rounded-lg p-3 md:p-4 transition-all duration-200 ${
                        selectedTicket === ticket.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <RadioGroupItem
                            value={ticket.id}
                            id={ticket.id}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={ticket.id}
                            className="flex-1 cursor-pointer"
                          >
                            <div>
                              <p className="font-medium text-sm md:text-base">{ticket.name}</p>
                              {ticket.requiresApproval && (
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  Requer aprovação
                                </p>
                              )}
                            </div>
                          </Label>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-base md:text-lg">
                            R$ {ticket.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                {selectedTicket && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm md:text-base">Quantidade:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => adjustQuantity(-1)}
                          disabled={quantity <= 1}
                          className="h-8 w-8"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => adjustQuantity(1)}
                          disabled={quantity >= 10}
                          className="h-8 w-8"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-base md:text-lg font-bold">
                      <span>Total:</span>
                      <span>R$ {totalPrice.toFixed(2)}</span>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        // In a real app, this would navigate to checkout
                        alert(`Redirecionando para pagamento: ${selectedTicketData?.name} (${quantity}x) - Total: R$ ${totalPrice.toFixed(2)}`);
                      }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Continuar para pagamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Event Description Section */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="bg-tikko-card-light text-gray-900 shadow-lg">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl text-gray-900">{event.title}</CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-gray-600">Organizado por {event.organizer}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-4 md:p-6 pt-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre o evento</h3>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base">
                    {event.description}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-tikko-orange/10 text-tikko-orange border-tikko-orange/20 text-xs md:text-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-lg font-bold text-primary">
                Tikko
              </Link>
              <Link 
                to="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar aos eventos
              </Link>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 Tikko. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}