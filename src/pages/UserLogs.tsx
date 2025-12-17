import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Calendar, Receipt } from 'lucide-react';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  duration_days: number | null;
  duration_hours: number | null;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
  rooms: { name: string } | null;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  issued_at: string;
  paid_at: string | null;
  bookings: { rooms: { name: string } | null } | null;
}

const UserLogs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    
    // Fetch user's bookings
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (name)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (bookingsData) {
      setBookings(bookingsData);
    }

    // Fetch user's invoices
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select(`
        *,
        bookings (rooms (name))
      `)
      .eq('user_id', user?.id)
      .order('issued_at', { ascending: false });

    if (invoicesData) {
      setInvoices(invoicesData);
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      confirmed: { variant: 'default' as const, label: 'Confirmed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
      paid: { variant: 'default' as const, label: 'Paid' },
      unpaid: { variant: 'secondary' as const, label: 'Unpaid' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading your logs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Activity</h1>
            <p className="text-muted-foreground">View your bookings and invoices</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/home')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="bookings">
              <Calendar className="mr-2 h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <Receipt className="mr-2 h-4 w-4" />
              Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>All your workspace bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No bookings yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time/Duration</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.rooms?.name || 'Unknown Room'}
                          </TableCell>
                          <TableCell>{formatDate(booking.booking_date)}</TableCell>
                          <TableCell>
                            {booking.start_time && booking.end_time
                              ? `${booking.start_time} - ${booking.end_time}`
                              : booking.duration_days
                              ? `${booking.duration_days} day(s)`
                              : `${booking.duration_hours} hour(s)`}
                          </TableCell>
                          <TableCell>${booking.total_price}</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {booking.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>My Invoices</CardTitle>
                <CardDescription>All your payment invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No invoices yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Issued Date</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Paid Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono text-sm">
                            {invoice.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {invoice.bookings?.rooms?.name || 'N/A'}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${invoice.amount}
                          </TableCell>
                          <TableCell>{formatDate(invoice.issued_at)}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>
                            {invoice.paid_at ? formatDate(invoice.paid_at) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserLogs;
