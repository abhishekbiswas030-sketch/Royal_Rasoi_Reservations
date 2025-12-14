import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  UtensilsCrossed, 
  ClipboardList, 
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ReservationStats {
  total: number;
  upcoming: number;
  completed: number;
}

interface UpcomingReservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  tables: {
    table_number: number;
    location: string;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReservationStats>({ total: 0, upcoming: 0, completed: 0 });
  const [upcomingReservations, setUpcomingReservations] = useState<UpcomingReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch all reservations for stats
        const { data: allReservations, error: statsError } = await supabase
          .from('reservations')
          .select('status, reservation_date, reservation_time')
          .eq('user_id', user.id);

        if (statsError) throw statsError;

        const now = new Date();
        const upcoming = allReservations?.filter(r => {
          const reservationDateTime = new Date(`${r.reservation_date}T${r.reservation_time}`);
          return reservationDateTime > now && r.status !== 'cancelled';
        }) || [];
        
        const completed = allReservations?.filter(r => r.status === 'completed') || [];

        setStats({
          total: allReservations?.length || 0,
          upcoming: upcoming.length,
          completed: completed.length,
        });

        // Fetch upcoming reservations with table details
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('reservations')
          .select(`
            id,
            reservation_date,
            reservation_time,
            tables (
              table_number,
              location
            )
          `)
          .eq('user_id', user.id)
          .in('status', ['pending', 'confirmed'])
          .gte('reservation_date', format(now, 'yyyy-MM-dd'))
          .order('reservation_date', { ascending: true })
          .order('reservation_time', { ascending: true })
          .limit(3);

        if (upcomingError) throw upcomingError;

        // Type assertion to handle the joined data
        setUpcomingReservations(upcomingData as unknown as UpcomingReservation[] || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const quickActions = [
    {
      title: 'Make a Reservation',
      description: 'Book your table now',
      icon: Calendar,
      link: '/reserve',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'View Tables',
      description: 'Explore our seating',
      icon: UtensilsCrossed,
      link: '/tables',
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'My Reservations',
      description: 'Manage bookings',
      icon: ClipboardList,
      link: '/my-reservations',
      color: 'bg-emerald-500/10 text-emerald-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Manage your reservations and explore Royal Rasoi
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="card-royal p-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Reservations</p>
              </div>
            </div>
          </div>
          
          <div className="card-royal p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.upcoming}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </div>
          
          <div className="card-royal p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Quick Actions
            </h2>
            <div className="grid gap-4">
              {quickActions.map((action, index) => (
                <Link key={action.link} to={action.link}>
                  <div 
                    className="card-royal p-5 flex items-center gap-4 group hover:border-accent/50 transition-all cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming Reservations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Upcoming Reservations
              </h2>
              {upcomingReservations.length > 0 && (
                <Link to="/my-reservations" className="text-sm text-accent hover:underline">
                  View all
                </Link>
              )}
            </div>
            
            {upcomingReservations.length === 0 ? (
              <div className="card-royal p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No upcoming reservations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any reservations scheduled.
                </p>
                <Link to="/reserve">
                  <Button className="bg-primary hover:bg-primary/90">
                    Make a Reservation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReservations.map((reservation, index) => (
                  <div 
                    key={reservation.id}
                    className="card-royal p-4 flex items-center gap-4 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        Table {reservation.tables.table_number}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {format(parseISO(reservation.reservation_date), 'EEEE, MMM d')} at {reservation.reservation_time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
