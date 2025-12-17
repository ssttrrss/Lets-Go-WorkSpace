import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { z } from 'zod';

interface Room {
  id: string;
  name: string;
  price_amount: number;
  price_unit: string;
}

interface BookingModalProps {
  room: Room;
  open: boolean;
  onClose: () => void;
}

const bookingSchema = z.object({
  booking_date: z.string().refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    { message: "Booking date must be today or later" }
  ),
  start_time: z.string().optional().refine(
    (time) => !time || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time),
    { message: "Invalid time format" }
  ),
  end_time: z.string().optional().refine(
    (time) => !time || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time),
    { message: "Invalid time format" }
  ),
  duration: z.number().int().min(1).max(365).optional(),
  notes: z.string().max(1000, { message: "Notes must be less than 1000 characters" }).optional(),
}).refine(
  (data) => {
    if (data.start_time && data.end_time) {
      return data.end_time > data.start_time;
    }
    return true;
  },
  { message: "End time must be after start time", path: ["end_time"] }
);

export const BookingModal = ({ room, open, onClose }: BookingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState('');

  const calculatePrice = () => {
    if (room.price_unit === 'hour') {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return hours > 0 ? hours * room.price_amount : room.price_amount;
    } else if (room.price_unit === 'day') {
      return duration * room.price_amount;
    } else {
      return room.price_amount;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate inputs
    const validationData: any = {
      booking_date: bookingDate,
      notes: notes || undefined,
    };

    if (room.price_unit === 'hour') {
      validationData.start_time = startTime;
      validationData.end_time = endTime;
    } else if (room.price_unit === 'day') {
      validationData.duration = duration;
    }

    const validation = bookingSchema.safeParse(validationData);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const totalPrice = calculatePrice();
    
    const bookingData: any = {
      user_id: user.id,
      room_id: room.id,
      booking_date: bookingDate,
      total_price: totalPrice,
      status: 'pending',
      notes: notes || null,
    };

    if (room.price_unit === 'hour') {
      bookingData.start_time = startTime;
      bookingData.end_time = endTime;
      bookingData.duration_hours = Math.round((new Date(`2000-01-01T${endTime}`).getTime() - new Date(`2000-01-01T${startTime}`).getTime()) / (1000 * 60 * 60));
    } else if (room.price_unit === 'day') {
      bookingData.duration_days = duration;
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      toast({
        title: 'Error',
        description: bookingError.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Create invoice
    const { error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        booking_id: booking.id,
        user_id: user.id,
        amount: totalPrice,
        status: 'pending',
      });

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError);
    }

    toast({
      title: 'Success!',
      description: 'Your booking has been created successfully.',
    });

    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {room.name}</DialogTitle>
          <DialogDescription>
            {room.price_amount} EGP per {room.price_unit}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-date">
              <Calendar className="w-4 h-4 inline mr-2" />
              Booking Date
            </Label>
            <Input
              id="booking-date"
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {room.price_unit === 'hour' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Start Time
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {room.price_unit === 'day' && (
            <div className="space-y-2">
              <Label htmlFor="duration">Number of Days</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          )}

          {room.price_unit === 'month' && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Monthly membership - billed at {room.price_amount} EGP/month
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Price:</span>
              <span className="text-2xl font-bold text-primary">
                {calculatePrice().toFixed(2)} EGP
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-secondary hover:bg-secondary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
