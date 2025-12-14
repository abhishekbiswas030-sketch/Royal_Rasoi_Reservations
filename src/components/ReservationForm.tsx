import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TableGrid from '@/components/TableGrid';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Users, Loader2, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  location: string;
}

const ReservationForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('');
  const [guestCount, setGuestCount] = useState<string>('2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  const [tables, setTables] = useState<Table[]>([]);
  const [reservedTableIds, setReservedTableIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all tables
  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number');

      if (error) {
        console.error('Error fetching tables:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tables. Please try again.',
          variant: 'destructive',
        });
      } else {
        setTables(data || []);
      }
      setLoading(false);
    };

    fetchTables();
  }, []);

  // Fetch reserved tables for selected date/time
  useEffect(() => {
    const fetchReservedTables = async () => {
      if (!date || !time) {
        setReservedTableIds([]);
        return;
      }

      const formattedDate = format(date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('reservations')
        .select('table_id')
        .eq('reservation_date', formattedDate)
        .eq('reservation_time', time)
        .in('status', ['pending', 'confirmed']);

      if (error) {
        console.error('Error fetching reservations:', error);
      } else {
        setReservedTableIds(data?.map((r) => r.table_id) || []);
      }
    };

    fetchReservedTables();
    setSelectedTableId(null); // Reset selection when date/time changes
  }, [date, time]);

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time || !selectedTableId || !user) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields and select a table.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('reservations').insert({
        user_id: user.id,
        table_id: selectedTableId,
        reservation_date: format(date, 'yyyy-MM-dd'),
        reservation_time: time,
        guest_count: parseInt(guestCount),
        special_requests: specialRequests || null,
        status: 'confirmed',
      });

      if (error) throw error;

      toast({
        title: 'Reservation Confirmed!',
        description: 'Your table has been successfully reserved.',
      });

      navigate('/my-reservations');
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'Reservation Failed',
        description: error.message || 'Failed to create reservation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Date & Time Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Select Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">Select Time *</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time slot">
                {time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {time}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 text-xs text-muted-foreground font-medium border-b">
                Lunch Hours
              </div>
              {timeSlots.slice(0, 8).map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
              <div className="p-2 text-xs text-muted-foreground font-medium border-b border-t mt-2">
                Dinner Hours
              </div>
              {timeSlots.slice(8).map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Guest Count */}
      <div className="space-y-2">
        <Label className="text-foreground font-medium">Number of Guests *</Label>
        <Select value={guestCount} onValueChange={setGuestCount}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {guestCount} {parseInt(guestCount) === 1 ? 'Guest' : 'Guests'}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-foreground font-medium text-lg">Select Your Table *</Label>
          {date && time && (
            <span className="text-sm text-muted-foreground">
              {tables.length - reservedTableIds.length} tables available
            </span>
          )}
        </div>
        
        {!date || !time ? (
          <div className="p-8 rounded-lg border border-dashed border-border bg-muted/50 text-center">
            <CalendarIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Please select a date and time to view available tables
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-lg border border-border bg-card">
            <TableGrid
              tables={tables}
              reservedTableIds={reservedTableIds}
              selectedTableId={selectedTableId}
              onSelectTable={setSelectedTableId}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Selected Table Info */}
      {selectedTable && (
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Table {selectedTable.table_number} Selected
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedTable.location} • {selectedTable.capacity} seats
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Special Requests */}
      <div className="space-y-2">
        <Label className="text-foreground font-medium">Special Requests (Optional)</Label>
        <Textarea
          placeholder="Any dietary restrictions, special occasions, or seating preferences..."
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={submitting || !date || !time || !selectedTableId}
        className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Confirming Reservation...
          </>
        ) : (
          <>
            <CalendarIcon className="w-5 h-5 mr-2" />
            Confirm Reservation
          </>
        )}
      </Button>
    </form>
  );
};

export default ReservationForm;
