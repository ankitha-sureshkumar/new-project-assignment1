import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PawBackground, PawPrint } from './PawPrint';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, Shield, Clock, Users, Star, Phone, MapPin, Mail } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const services = [
    {
      title: "Health Checkups",
      description: "Comprehensive health examinations for your beloved pets",
      icon: <Heart className="w-8 h-8 text-primary" />,
      price: "From $50"
    },
    {
      title: "Vaccinations",
      description: "Keep your pets protected with up-to-date vaccinations",
      icon: <Shield className="w-8 h-8 text-primary" />,
      price: "From $30"
    },
    {
      title: "Emergency Care",
      description: "24/7 emergency services for urgent pet care needs",
      icon: <Clock className="w-8 h-8 text-accent" />,
      price: "Available 24/7"
    },
    {
      title: "Grooming",
      description: "Professional grooming services to keep pets clean and happy",
      icon: <Users className="w-8 h-8 text-secondary" />,
      price: "From $40"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      pet: "Golden Retriever - Max",
      rating: 5,
      comment: "The care Max received was exceptional. Dr. Smith was so gentle and thorough!"
    },
    {
      name: "Mike Chen",
      pet: "Persian Cat - Luna",
      rating: 5,
      comment: "Best veterinary clinic in town! Luna loves coming here for her checkups."
    },
    {
      name: "Emily Davis",
      pet: "Beagle - Charlie",
      rating: 5,
      comment: "Professional, caring, and affordable. Highly recommend Oggy's Pet Hospital!"
    }
  ];

  return (
    <PawBackground className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
                  Caring for Your Pets with
                  <span className="text-primary block">Love & Expertise</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Professional veterinary care for all your beloved companions. 
                  Book appointments with certified veterinarians and manage your pet's health journey.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => onNavigate('register')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
                >
                  Get Started
                  <PawPrint className="ml-2" size="sm" opacity={1} />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => onNavigate('login')}
                  className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8 py-3"
                >
                  Sign In
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Card className="overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1692933639877-c857c4629abb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGV0cyUyMGRvZ3MlMjBjYXRzJTIwdmV0ZXJpbmFyeSUyMGNsaW5pY3xlbnwxfHx8fDE3NTg5NjMwNjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Happy pets at Oggy's Pet Hospital"
                  className="w-full h-96 object-cover"
                />
              </Card>
              <PawPrint className="absolute -top-4 -right-4 text-accent" size="lg" opacity={0.3} />
              <PawPrint className="absolute -bottom-4 -left-4 text-primary" size="md" opacity={0.2} />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive veterinary care tailored to your pet's unique needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit group-hover:bg-primary/10 transition-colors">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-primary">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              What Pet Parents Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from our satisfied customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="text-sm text-primary">
                    {testimonial.pet}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground italic">"{testimonial.comment}"</p>
                </CardContent>
                <PawPrint className="absolute top-4 right-4 text-primary" size="sm" opacity={0.1} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <PawPrint className="text-primary" size="lg" opacity={1} />
                <h3 className="text-xl font-bold">Oggy's Pet Hospital</h3>
              </div>
              <p className="text-secondary-foreground/80 mb-4">
                Providing exceptional veterinary care with love, compassion, and expertise since 2020.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>(555) 123-PETS</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>care@oggypethospital.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>123 Pet Care Lane, Animal City, AC 12345</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <p className="cursor-pointer hover:text-primary transition-colors">About Us</p>
                <p className="cursor-pointer hover:text-primary transition-colors">Services</p>
                <p className="cursor-pointer hover:text-primary transition-colors">Emergency Care</p>
                <p className="cursor-pointer hover:text-primary transition-colors">Contact</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Pet Parents</h4>
              <div className="space-y-2 text-sm">
                <p 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onNavigate('register')}
                >
                  Register
                </p>
                <p 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onNavigate('login')}
                >
                  Login
                </p>
                <p className="cursor-pointer hover:text-primary transition-colors">Pet Care Tips</p>
                <p className="cursor-pointer hover:text-primary transition-colors">FAQ</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-secondary-foreground/20 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2025 Oggy's Pet Hospital. All rights reserved. Made with ❤️ for pets and their families.</p>
          </div>
        </div>
      </footer>
    </PawBackground>
  );
}