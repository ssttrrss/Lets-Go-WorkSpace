import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogOut, Calendar, DollarSign, Users, Trash2, CheckCircle, XCircle, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RoomManagement } from '@/components/RoomManagement';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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
  user_id: string;
  rooms: { name: string } | null;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  issued_at: string;
  paid_at: string | null;
  user_id: string;
  bookings: { rooms: { name: string } | null } | null;
}

interface UserProfile {
  [key: string]: { email: string; full_name: string };
}

const Admin = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }

    fetchBookings();
    fetchInvoices();
    
    // Set up realtime subscription for bookings
    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
    };
  }, [user, isAdmin, navigate]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (name)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setBookings(data);
      
      // Fetch user profiles separately
      const userIds = [...new Set(data.map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      
      if (profiles) {
        const profilesMap: UserProfile = {};
        profiles.forEach(p => {
          profilesMap[p.id] = { email: p.email || '', full_name: p.full_name || '' };
        });
        setUserProfiles(prev => ({ ...prev, ...profilesMap }));
      }
    }
  };

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select(`
        *,
        bookings (rooms (name))
      `)
      .order('issued_at', { ascending: false });

    if (data) {
      setInvoices(data);
      
      // Fetch user profiles separately
      const userIds = [...new Set(data.map(i => i.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      
      if (profiles) {
        const profilesMap: UserProfile = {};
        profiles.forEach(p => {
          profilesMap[p.id] = { email: p.email || '', full_name: p.full_name || '' };
        });
        setUserProfiles(prev => ({ ...prev, ...profilesMap }));
      }
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteDialog.id) return;

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', deleteDialog.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete booking',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });
      fetchBookings();
    }

    setDeleteDialog({ open: false, id: null });
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Booking status updated',
      });
      fetchBookings();
    }
  };

  const handleUpdateInvoiceStatus = async (id: string, status: string) => {
    const updateData: any = { status };
    if (status === 'paid' && !invoices.find(i => i.id === id)?.paid_at) {
      updateData.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update invoice status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Invoice status updated',
      });
      fetchInvoices();
    }
  };

  const handleUpdateInvoiceAmount = async (id: string, amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Invalid amount',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('invoices')
      .update({ amount })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update invoice amount',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Invoice amount updated',
      });
      fetchInvoices();
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-workspace-light">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-strong">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-primary-foreground/80 mt-1">Manage bookings and invoices</p>
            </div>
            <Button 
              variant="secondary" 
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>
          
          <Card className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>
          
          <Card className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.reduce((sum, b) => sum + parseFloat(b.total_price.toString()), 0).toFixed(2)} EGP
              </div>
              <p className="text-xs text-muted-foreground">From all bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage and track all workspace bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time/Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{userProfiles[booking.user_id]?.full_name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{userProfiles[booking.user_id]?.email || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.rooms?.name || 'N/A'}</TableCell>
                        <TableCell>{formatDate(booking.booking_date)}</TableCell>
                        <TableCell>
                          {booking.start_time ? (
                            <span>{booking.start_time} - {booking.end_time}</span>
                          ) : booking.duration_days ? (
                            <span>{booking.duration_days} days</span>
                          ) : (
                            'Monthly'
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">{booking.total_price} EGP</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteDialog({ open: true, id: booking.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices Management</CardTitle>
                <CardDescription>View and manage all invoices, update payment status and amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">
                          {invoice.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{userProfiles[invoice.user_id]?.full_name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{userProfiles[invoice.user_id]?.email || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {invoice.bookings?.rooms?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={invoice.amount}
                            onBlur={(e) => handleUpdateInvoiceAmount(invoice.id, parseFloat(e.target.value))}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={invoice.status}
                            onValueChange={(value) => handleUpdateInvoiceStatus(invoice.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{formatDate(invoice.issued_at)}</TableCell>
                        <TableCell>
                          {invoice.paid_at ? (
                            <span className="text-xs text-muted-foreground">
                              Paid: {formatDate(invoice.paid_at)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not paid</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rooms">
            <RoomManagement />
          </TabsContent>
        </Tabs>
      </section>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking and associated invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBooking} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
