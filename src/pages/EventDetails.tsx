import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Minus, Plus } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background"></div>
        </div>
        
        <div className="relative z-10 h-full flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg">{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg">{event.time}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos eventos
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details Section */}
          <div className="lg:col-span-2">
            <Card className="bg-tikko-card-light text-gray-900 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">{event.title}</CardTitle>
                <p className="text-gray-600">Organizado por {event.organizer}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sobre o evento</h3>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {event.description}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-tikko-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{event.venue}</p>
                      <p className="text-sm text-gray-600">{event.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-tikko-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{event.date}</p>
                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-tikko-orange/10 text-tikko-orange border-tikko-orange/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Selection Section */}
          <div className="lg:col-span-1">
            <Card className="bg-card shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl">Obter ingressos</CardTitle>
                <p className="text-muted-foreground">
                  Por favor, escolha o tipo de ingresso desejado:
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={selectedTicket}
                  onValueChange={setSelectedTicket}
                  className="space-y-3"
                >
                  {event.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
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
                              <p className="font-medium">{ticket.name}</p>
                              {ticket.requiresApproval && (
                                <p className="text-sm text-muted-foreground">
                                  Requer aprovação
                                </p>
                              )}
                            </div>
                          </Label>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
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
                      <span className="font-medium">Quantidade:</span>
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

                    <div className="flex items-center justify-between text-lg font-bold">
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