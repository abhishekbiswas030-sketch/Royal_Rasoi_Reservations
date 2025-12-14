import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import TableGrid from '@/components/TableGrid';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { UtensilsCrossed, CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  location: string;
}

const Tables: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservedTableIds, setReservedTableIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('');

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
  }, [date, time]);

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  // Group tables by location for stats
  const tablesByLocation = tables.reduce((acc, table) => {
    if (!acc[table.location]) {
      acc[table.location] = [];
    }
    acc[table.location].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  const locationStats = Object.entries(tablesByLocation).map(([location, locationTables]) => ({
    location,
    count: locationTables.length,
    available: locationTables.filter(t => !reservedTableIds.includes(t.id)).length,
    capacityRange: `${Math.min(...locationTables.map(t => t.capacity))}-${Math.max(...locationTables.map(t => t.capacity))}`,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Table Layout
            </h1>
          </div>
          <p className="text-muted-foreground ml-13">
            Explore our 100 tables across 4 unique dining zones
          </p>
        </div>

        {/* Date/Time Filter */}
        <div className="card-royal p-6 mb-8 animate-slide-up">
          <h2 className="font-semibold text-foreground mb-4">Check Availability</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
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

            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select time">
                  {time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {time}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Link to="/reserve" className="sm:ml-auto">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                Make Reservation
              </Button>
            </Link>
          </div>
        </div>

        {/* Location Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {locationStats.map((stat, index) => (
            <div 
              key={stat.location}
              className="card-royal p-4 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{stat.location}</h3>
                  <p className="text-sm text-muted-foreground">
                    {date && time ? (
                      <span className="text-emerald-600">{stat.available} available</span>
                    ) : (
                      `${stat.count} tables`
                    )}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{stat.capacityRange} seats</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Grid */}
        <div className="card-royal p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              All Tables
            </h2>
            {date && time && (
              <span className="text-sm text-muted-foreground">
                Showing availability for {format(date, 'MMM d')} at {time}
              </span>
            )}
          </div>
          
          <TableGrid
            tables={tables}
            reservedTableIds={reservedTableIds}
            selectedTableId={null}
            onSelectTable={() => {}}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Tables;
