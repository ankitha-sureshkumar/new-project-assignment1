import { PawPrint } from './PawPrint';
import { Phone, MapPin, Mail, Heart, Clock, Users, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      // If no navigation handler provided, scroll to top (useful for static pages)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const services = [
    { name: 'Health Checkups', icon: <Heart className="w-4 h-4" /> },
    { name: 'Vaccinations', icon: <Shield className="w-4 h-4" /> },
    { name: 'Emergency Care', icon: <Clock className="w-4 h-4" /> },
    { name: 'Pet Grooming', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <PawPrint className="text-primary" size="lg" opacity={1} />
              <h3 className="text-xl font-bold">Oggy's Pet Hospital</h3>
            </div>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              Providing exceptional veterinary care with love, compassion, and expertise since 2020. 
              We are committed to the health and happiness of your beloved pets.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span>(555) 123-PETS</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span>care@oggypethospital.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>123 Pet Care Lane, Animal City, AC 12345</span>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
              <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                24/7 Emergency Care
              </h4>
              <p className="text-sm text-secondary-foreground/80">
                Call us anytime for emergency pet care. Our dedicated team is always ready to help.
              </p>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <button 
                className="block cursor-pointer hover:text-primary transition-colors text-left"
                onClick={() => handleNavigation('home')}
              >
                Home
              </button>
              <button className="block cursor-pointer hover:text-primary transition-colors text-left">
                About Us
              </button>
              <button className="block cursor-pointer hover:text-primary transition-colors text-left">
                Our Team
              </button>
              <button className="block cursor-pointer hover:text-primary transition-colors text-left">
                Services
              </button>
              <button className="block cursor-pointer hover:text-primary transition-colors text-left">
                Emergency Care
              </button>
              <button className="block cursor-pointer hover:text-primary transition-colors text-left">
                Contact Us
              </button>
              <button className="block cursor-pointer hover:text-primary transition-colors text-left">
                Careers
              </button>
              {onNavigate && (
                <button 
                  className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-colors text-left text-sm font-medium border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-3 py-2 rounded mt-3 text-red-700"
                  onClick={() => onNavigate('admin-login')}
                >
                  <Shield className="w-4 h-4" />
                  Admin Portal
                </button>
              )}
            </div>
          </div>
          
          {/* For Pet Parents */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">For Pet Parents</h4>
            <div className="space-y-2 text-sm">
              {onNavigate && (
                <>
                  <button 
                    className="block cursor-pointer hover:text-primary transition-colors text-left"
                    onClick={() => onNavigate('register')}
                  >
                    Register Account
                  </button>
                  <button 
                    className="block cursor-pointer hover:text-primary transition-colors text-left"
                    onClick={() => onNavigate('login')}
                  >
                    Pet Parent Login
                  </button>
                  <button 
                    className="block cursor-pointer hover:text-primary transition-colors text-left"
                    onClick={() => onNavigate('login')}
                  >
                    Veterinarian Login
                  </button>
                </>
              )}
              <button className="block cursor-pointer hover:text-primary transition-colors text-left">
                Book Appointment
              </button>
              <button className="block cursor-pointer hover:text-primary transition-colors text-left">
                Pet Care Tips
              </button>
              <button className="block cursor-pointer hover:text-primary transition-colors text-left">
                Health Resources
              </button>
              <button className="block cursor-pointer hover:text-primary transition-colors text-left">
                FAQ
              </button>
            </div>

            {/* Services List */}
            <div className="mt-6">
              <h5 className="font-medium mb-3 text-accent">Our Services</h5>
              <div className="space-y-2">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-secondary-foreground/70">
                    {service.icon}
                    <span>{service.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-secondary-foreground/70">
              &copy; {currentYear} Oggy's Pet Hospital. All rights reserved. Made with ❤️ for pets and their families.
            </p>
            <div className="flex gap-6 text-xs">
              <button className="hover:text-primary transition-colors">Privacy Policy</button>
              <button className="hover:text-primary transition-colors">Terms of Service</button>
              <button className="hover:text-primary transition-colors">Cookie Policy</button>
              <button className="hover:text-primary transition-colors">Accessibility</button>
            </div>
          </div>
          
          {/* Fun pet fact */}
          <div className="mt-6 text-center">
            <p className="text-xs text-secondary-foreground/60 italic">
              🐾 Did you know? A cat's purr can help heal bones and reduce pain! 🐾
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}