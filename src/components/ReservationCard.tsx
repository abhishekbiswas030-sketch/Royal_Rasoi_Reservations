import React from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  UtensilsCrossed,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

interface ReservationCardProps {
  reservation: Reservation;
  onCancel: (id: string) => void;
  cancelling?: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onCancel,
  cancelling = false,
}) => {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const isPast = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`) < new Date();
  const canCancel = !isPast && reservation.status !== 'cancelled' && reservation.status !== 'completed';

  return (
    <div className={cn(
      "card-royal p-6 transition-all duration-300",
      isPast && "opacity-70"
    )}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section - Main Info */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-7 h-7 text-primary" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Table {reservation.tables.table_number}
              </h3>
              <Badge className={cn("border", statusColors[reservation.status])}>
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {format(parseISO(reservation.reservation_date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{reservation.reservation_time}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {reservation.guest_count} {reservation.guest_count === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{reservation.tables.location}</span>
              </div>
            </div>

            {reservation.special_requests && (
              <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Special Requests: </span>
                {reservation.special_requests}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Actions */}
        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                disabled={cancelling}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Cancel Reservation
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel your reservation for Table {reservation.tables.table_number} on{' '}
                  {format(parseISO(reservation.reservation_date), 'MMMM d, yyyy')} at {reservation.reservation_time}?
                  <br /><br />
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onCancel(reservation.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Yes, Cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default ReservationCard;
