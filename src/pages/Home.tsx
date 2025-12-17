import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Clock, Calendar, Users, FileText } from 'lucide-react';
import { BookingModal } from '@/components/BookingModal';
import heroImage from '@/assets/hero-workspace.jpg';
import privateOfficeImg from '@/assets/private-office.jpg';
import sharedSpaceImg from '@/assets/shared-space.jpg';
import meetingRoomImg from '@/assets/meeting-room.jpg';

interface Room {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  price_unit: string;
  capacity: number;
  amenities: string[];
  image_url?: string;
}

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchRooms();
  }, [user, navigate]);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_available', true)
      .order('price_amount', { ascending: true });

    if (data) {
      setRooms(data);
    }
  };

  const getRoomImage = (roomName: string) => {
    if (roomName.includes('Private')) return privateOfficeImg;
    if (roomName.includes('Shared')) return sharedSpaceImg;
    if (roomName.includes('Meeting')) return meetingRoomImg;
    return privateOfficeImg;
  };

  const getPriceDisplay = (room: Room) => {
    const unit = room.price_unit === 'hour' ? '/Hour' : 
                 room.price_unit === 'day' ? '/Day' : '/Month';
    return `${room.price_amount} EGP${unit}`;
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-workspace-light animate-fade-in">
      {/* Header */}
      <header className="bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Lets Go WorkSpace</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/logs')}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              My Activity
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Workspace" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-workspace-teal/80 flex items-center">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-bold text-white mb-4 animate-slide-up">
              Find Your Perfect Space
            </h2>
            <p className="text-xl text-white/90 max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Professional workspaces designed for productivity and collaboration
            </p>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold mb-8">Available Rooms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <Card 
              key={room.id} 
              className="overflow-hidden transition-smooth hover:shadow-strong hover:-translate-y-1 animate-scale-in"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={getRoomImage(room.name)} 
                  alt={room.name}
                  className="w-full h-full object-cover transition-smooth hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{room.name}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    <Users className="w-3 h-3 mr-1" />
                    {room.capacity}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {room.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities?.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {room.amenities?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{room.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {room.price_unit === 'hour' && <Clock className="w-4 h-4" />}
                  {room.price_unit !== 'hour' && <Calendar className="w-4 h-4" />}
                  <span className="text-sm capitalize">{room.price_unit}ly Booking</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">
                  {getPriceDisplay(room)}
                </div>
                <Button 
                  onClick={() => handleBookRoom(room)}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          open={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
};

export default Home;
