import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import ReservationCard from '@/components/ReservationCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { ClipboardList, Calendar, Loader2 } from 'lucide-react';

interface Reservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  special_requests: string | null;
  status: string;
  tables: {
    table_number: number;
    capacity: number;
    location: string;
  };
}

const MyReservations: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchReservations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reservation_date,
          reservation_time,
          guest_count,
          special_requests,
          status,
          tables (
            table_number,
            capacity,
            location
          )
        `)
        .eq('user_id', user.id)
        .order('reservation_date', { ascending: false })
        .order('reservation_time', { ascending: false });

      if (error) throw error;

      // Type assertion to handle the joined data
      setReservations(data as unknown as Reservation[] || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reservations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const handleCancel = async (reservationId: string) => {
    setCancelling(true);

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (error) throw error;

      toast({
        title: 'Reservation Cancelled',
        description: 'Your reservation has been cancelled successfully.',
      });

      // Refresh the list
      await fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel reservation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const now = new Date();

  const upcomingReservations = reservations.filter(r => {
    const reservationDateTime = new Date(`${r.reservation_date}T${r.reservation_time}`);
    return reservationDateTime > now && r.status !== 'cancelled';
  });

  const pastReservations = reservations.filter(r => {
    const reservationDateTime = new Date(`${r.reservation_date}T${r.reservation_time}`);
    return reservationDateTime <= now || r.status === 'cancelled' || r.status === 'completed';
  });

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                My Reservations
              </h1>
              <p className="text-muted-foreground">
                {reservations.length} total reservations
              </p>
            </div>
          </div>
          
          <Link to="/reserve">
            <Button className="bg-primary hover:bg-primary/90">
              <Calendar className="w-4 h-4 mr-2" />
              New Reservation
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="animate-slide-up">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming" className="px-6">
              Upcoming ({upcomingReservations.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="px-6">
              Past ({pastReservations.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {upcomingReservations.length === 0 ? (
              <div className="card-royal p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No Upcoming Reservations
                </h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any upcoming reservations. Book a table now!
                </p>
                <Link to="/reserve">
                  <Button className="bg-primary hover:bg-primary/90">
                    Make a Reservation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingReservations.map((reservation, index) => (
                  <div
                    key={reservation.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ReservationCard
                      reservation={reservation}
                      onCancel={handleCancel}
                      cancelling={cancelling}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {pastReservations.length === 0 ? (
              <div className="card-royal p-12 text-center">
                <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No Past Reservations
                </h3>
                <p className="text-muted-foreground">
                  Your reservation history will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastReservations.map((reservation, index) => (
                  <div
                    key={reservation.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ReservationCard
                      reservation={reservation}
                      onCancel={handleCancel}
                      cancelling={cancelling}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyReservations;
