import React from 'react';
import Navbar from '@/components/Navbar';
import ReservationForm from '@/components/ReservationForm';
import { Calendar } from 'lucide-react';

const Reserve: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Reserve a Table
            </h1>
          </div>
          <p className="text-muted-foreground ml-13">
            Select your preferred date, time, and table to complete your reservation
          </p>
        </div>

        {/* Reservation Form */}
        <div className="max-w-4xl mx-auto">
          <div className="card-royal p-6 md:p-8 animate-slide-up">
            <ReservationForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reserve;
