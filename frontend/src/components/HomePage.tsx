import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PawBackground, PawPrint } from './PawPrint';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Footer } from './Footer';
import { Heart, Shield, Clock, Users, Star } from 'lucide-react';

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
      comment: "The care Max received was exceptional. Dr. Smith was so gentle and thorough!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b665?w=150&h=150&fit=crop&crop=face&auto=format",
      petImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=60&h=60&fit=crop&crop=face&auto=format"
    },
    {
      name: "Mike Chen",
      pet: "Persian Cat - Luna",
      rating: 5,
      comment: "Best veterinary clinic in town! Luna loves coming here for her checkups.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
      petImage: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=60&h=60&fit=crop&crop=face&auto=format"
    },
    {
      name: "Emily Davis",
      pet: "Beagle - Charlie",
      rating: 5,
      comment: "Professional, caring, and affordable. Highly recommend Oggy's Pet Hospital!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format",
      petImage: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=60&h=60&fit=crop&crop=face&auto=format"
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
              <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <ImageWithFallback
                        src={testimonial.avatar}
                        alt={`${testimonial.name}'s profile picture`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-gray-200">
                        <ImageWithFallback
                          src={testimonial.petImage}
                          alt={testimonial.pet}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                      <CardTitle className="text-lg font-semibold">{testimonial.name}</CardTitle>
                      <CardDescription className="text-sm text-primary font-medium">
                        {testimonial.pet}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground italic leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <PawPrint className="absolute bottom-4 right-4 text-primary" size="sm" opacity={0.1} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </PawBackground>
  );
}