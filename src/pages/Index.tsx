import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  UtensilsCrossed, 
  Calendar, 
  Clock, 
  MapPin, 
  Star,
  ArrowRight,
  Phone,
  Mail
} from 'lucide-react';

const Index: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'Easy Reservations',
      description: 'Book your table in seconds with our intuitive reservation system.',
    },
    {
      icon: UtensilsCrossed,
      title: '100 Tables',
      description: 'Choose from a variety of seating options across different zones.',
    },
    {
      icon: Clock,
      title: 'Flexible Timing',
      description: 'Lunch and dinner slots available throughout the week.',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      text: 'The best dining experience in the city! The reservation system made it so easy to plan our anniversary dinner.',
      rating: 5,
    },
    {
      name: 'Rahul Verma',
      text: 'Excellent food and ambiance. The online booking saved us so much time.',
      rating: 5,
    },
    {
      name: 'Anita Patel',
      text: 'A royal experience indeed! From booking to dining, everything was perfect.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">Premium Dining Experience</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Welcome to{' '}
              <span className="text-primary">Royal</span>{' '}
              <span className="text-accent">Rasoi</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the authentic flavors of India in a royal setting. 
              Reserve your table and embark on a culinary journey like no other.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {user ? (
                <Link to="/reserve">
                  <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90">
                    <Calendar className="w-5 h-5 mr-2" />
                    Reserve a Table
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90">
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Royal Rasoi?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We combine traditional flavors with modern convenience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-royal p-8 text-center group hover:border-accent/50 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Guests Say
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join thousands of satisfied diners
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card-royal p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.text}"
                </p>
                <p className="font-semibold text-foreground">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Dine with Us?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Reserve your table now and experience the royal treatment
          </p>
          {user ? (
            <Link to="/reserve">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
                <Calendar className="w-5 h-5 mr-2" />
                Make a Reservation
              </Button>
            </Link>
          ) : (
            <Link to="/signup">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
                Sign Up Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold text-primary">
                  Royal Rasoi
                </span>
              </div>
              <p className="text-muted-foreground">
                Experience the finest Indian cuisine in a royal ambiance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>123 Royal Street, Food City</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 1234567890</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@royalrasoi.com</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Hours</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>Lunch: 11:00 AM - 3:00 PM</p>
                <p>Dinner: 6:00 PM - 11:00 PM</p>
                <p>Closed on Mondays</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>© 2024 Royal Rasoi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
