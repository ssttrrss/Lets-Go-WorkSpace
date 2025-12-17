import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Room {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  price_amount: number;
  price_unit: string;
  is_available: boolean;
  amenities: string[] | null;
  image_url: string | null;
}

export const RoomManagement = () => {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    price_amount: '',
    price_unit: 'hour',
    is_available: true,
    amenities: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .order('name');
    
    if (data) {
      setRooms(data);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      capacity: '',
      price_amount: '',
      price_unit: 'hour',
      is_available: true,
      amenities: '',
    });
    setEditingRoom(null);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      capacity: room.capacity?.toString() || '',
      price_amount: room.price_amount.toString(),
      price_unit: room.price_unit,
      is_available: room.is_available,
      amenities: room.amenities?.join(', ') || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const roomData = {
      name: formData.name,
      description: formData.description || null,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      price_amount: parseFloat(formData.price_amount),
      price_unit: formData.price_unit,
      is_available: formData.is_available,
      amenities: formData.amenities
        ? formData.amenities.split(',').map(a => a.trim()).filter(a => a)
        : null,
    };

    if (editingRoom) {
      // Update existing room
      const { error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', editingRoom.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update room',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Room updated successfully',
        });
        setDialogOpen(false);
        resetForm();
        fetchRooms();
      }
    } else {
      // Create new room
      const { error } = await supabase
        .from('rooms')
        .insert([roomData]);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create room',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Room created successfully',
        });
        setDialogOpen(false);
        resetForm();
        fetchRooms();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Room deleted successfully',
      });
      fetchRooms();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Room Management</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              <DialogDescription>
                {editingRoom ? 'Update room details' : 'Create a new workspace room'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Private Office"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Room description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., 4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_amount">Price</Label>
                  <Input
                    id="price_amount"
                    type="number"
                    step="0.01"
                    value={formData.price_amount}
                    onChange={(e) => setFormData({ ...formData, price_amount: e.target.value })}
                    placeholder="e.g., 25.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_unit">Price Unit</Label>
                <Select
                  value={formData.price_unit}
                  onValueChange={(value) => setFormData({ ...formData, price_unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Per Hour</SelectItem>
                    <SelectItem value="day">Per Day</SelectItem>
                    <SelectItem value="month">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="e.g., WiFi, Coffee, Projector"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label htmlFor="is_available">Available for booking</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingRoom ? 'Update' : 'Create'} Room
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Amenities</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">{room.name}</TableCell>
                <TableCell>{room.capacity || '-'}</TableCell>
                <TableCell>
                  ${room.price_amount}/{room.price_unit}
                </TableCell>
                <TableCell>
                  {room.is_available ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {room.amenities?.join(', ') || '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(room)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(room.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
