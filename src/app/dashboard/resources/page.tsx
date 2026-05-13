"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import api from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface HotelRoom {
  _id: string
  room_number: string
  floor?: string | null
  capacity: number
  active: boolean
}

interface Hotel {
  _id: string
  name: string
  city?: string | null
  address?: string | null
  notes?: string | null
  rooms: HotelRoom[]
  active: boolean
  created_at: string
}

interface Bus {
  _id: string
  bus_number: string
  driver_name: string
  destination: string
  departure_time: string
  active: boolean
}

export default function ResourcesPage() {
  const [loading, setLoading] = useState(true)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [buses, setBuses] = useState<Bus[]>([])

  const [hotelForm, setHotelForm] = useState({ name: "", city: "", address: "", notes: "" })
  const [busForm, setBusForm] = useState({
    bus_number: "",
    driver_name: "",
    destination: "",
    departure_time: "",
    plate_number: "",
    seats_count: "50",
    notes: "",
  })

  const [roomHotelId, setRoomHotelId] = useState<string>("")
  const [roomForm, setRoomForm] = useState({ room_number: "", floor: "", capacity: "1" })

  const [openHotel, setOpenHotel] = useState(false)
  const [openBus, setOpenBus] = useState(false)
  const [openOption, setOpenOption] = useState(false)
  const [openRoom, setOpenRoom] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [hotelsRes, busesRes] = await Promise.all([
        api.get("/hotels"),
        api.get("/buses"),
      ])

      setHotels(hotelsRes.data?.data || [])
      setBuses(busesRes.data?.data || [])
    } catch (error) {
      console.error(error)
      toast.error("Failed to load resources")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAll()
  }, [])

  const createHotel = async () => {
    try {
      await api.post("/hotels", hotelForm)
      toast.success("Hotel created")
      setOpenHotel(false)
      setHotelForm({ name: "", city: "", address: "", notes: "" })
      await fetchAll()
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || "Failed to create hotel")
    }
  }

  const createBus = async () => {
    try {
      await api.post("/buses", {
        ...busForm,
        seats_count: Number(busForm.seats_count),
      })
      toast.success("Bus created")
      setOpenBus(false)
      setBusForm({
        bus_number: "",
        driver_name: "",
        destination: "",
        departure_time: "",
        plate_number: "",
        seats_count: "50",
        notes: "",
      })
      await fetchAll()
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || "Failed to create bus")
    }
  }

  const addRoom = async () => {
    if (!roomHotelId) {
      toast.error("Please choose a hotel first")
      return
    }

    try {
      await api.post(`/hotels/${roomHotelId}/rooms`, {
        room_number: roomForm.room_number,
        floor: roomForm.floor,
        capacity: Number(roomForm.capacity),
      })
      toast.success("Room added")
      setOpenRoom(false)
      setRoomForm({ room_number: "", floor: "", capacity: "1" })
      setRoomHotelId("")
      await fetchAll()
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || "Failed to add room")
    }
  }

  const deleteHotel = async (id: string) => {
    try {
      await api.delete(`/hotels/${id}`)
      toast.success("Hotel deleted")
      await fetchAll()
    } catch {
      toast.error("Failed to delete hotel")
    }
  }

  const deleteBus = async (id: string) => {
    try {
      await api.delete(`/buses/${id}`)
      toast.success("Bus deleted")
      await fetchAll()
    } catch {
      toast.error("Failed to delete bus")
    }
  }

  const removeRoom = async (hotelId: string, roomId: string) => {
    try {
      await api.delete(`/hotels/${hotelId}/rooms/${roomId}`)
      toast.success("Room removed")
      await fetchAll()
    } catch {
      toast.error("Failed to remove room")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Resource Management</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Dialog open={openHotel} onOpenChange={setOpenHotel}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create Hotel</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Hotel</DialogTitle>
              <DialogDescription>Create a reusable hotel profile and then add rooms.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={hotelForm.name} onChange={(e) => setHotelForm((s) => ({ ...s, name: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={hotelForm.city} onChange={(e) => setHotelForm((s) => ({ ...s, city: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={hotelForm.address} onChange={(e) => setHotelForm((s) => ({ ...s, address: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={hotelForm.notes} onChange={(e) => setHotelForm((s) => ({ ...s, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button onClick={createHotel}>Save Hotel</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openRoom} onOpenChange={setOpenRoom}>
          <DialogTrigger asChild>
            <Button variant="outline"><Plus className="mr-2 h-4 w-4" />Add Hotel Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Room</DialogTitle>
              <DialogDescription>Attach a room to an existing hotel.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label>Hotel</Label>
                <Select value={roomHotelId} onValueChange={setRoomHotelId}>
                  <SelectTrigger><SelectValue placeholder="Select hotel" /></SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel._id} value={hotel._id}>{hotel.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input value={roomForm.room_number} onChange={(e) => setRoomForm((s) => ({ ...s, room_number: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Floor</Label>
                <Input value={roomForm.floor} onChange={(e) => setRoomForm((s) => ({ ...s, floor: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" min="1" value={roomForm.capacity} onChange={(e) => setRoomForm((s) => ({ ...s, capacity: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button onClick={addRoom}>Save Room</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openBus} onOpenChange={setOpenBus}>
          <DialogTrigger asChild>
            <Button variant="outline"><Plus className="mr-2 h-4 w-4" />Create Bus</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Bus</DialogTitle>
              <DialogDescription>Create a reusable bus schedule/profile.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label>Bus Number</Label>
                <Input value={busForm.bus_number} onChange={(e) => setBusForm((s) => ({ ...s, bus_number: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Driver Name</Label>
                <Input value={busForm.driver_name} onChange={(e) => setBusForm((s) => ({ ...s, driver_name: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Destination</Label>
                <Input value={busForm.destination} onChange={(e) => setBusForm((s) => ({ ...s, destination: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Departure Time</Label>
                <Input type="datetime-local" value={busForm.departure_time} onChange={(e) => setBusForm((s) => ({ ...s, departure_time: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Plate Number</Label>
                <Input placeholder="Optional" value={busForm.plate_number} onChange={(e) => setBusForm((s) => ({ ...s, plate_number: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Seats</Label>
                <Input type="number" min="1" value={busForm.seats_count} onChange={(e) => setBusForm((s) => ({ ...s, seats_count: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input placeholder="Optional details..." value={busForm.notes} onChange={(e) => setBusForm((s) => ({ ...s, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button onClick={createBus}>Save Bus</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Hotels & Rooms</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {loading ? <p>Loading...</p> : hotels.length === 0 ? <p className="text-sm text-muted-foreground">No hotels yet.</p> : hotels.map((hotel) => (
              <div key={hotel._id} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{hotel.name}</p>
                    <p className="text-xs text-muted-foreground">{hotel.city || "No city"} - created {formatDate(hotel.created_at)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => void deleteHotel(hotel._id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hotel.rooms.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground">No rooms</TableCell></TableRow>
                    ) : hotel.rooms.map((room) => (
                      <TableRow key={room._id}>
                        <TableCell>{room.room_number}</TableCell>
                        <TableCell>{room.floor || "-"}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => void removeRoom(hotel._id, room._id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Buses</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus #</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                ) : buses.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No buses yet.</TableCell></TableRow>
                ) : buses.map((bus) => (
                  <TableRow key={bus._id}>
                    <TableCell>{bus.bus_number}</TableCell>
                    <TableCell>{bus.driver_name}</TableCell>
                    <TableCell>{bus.destination}</TableCell>
                    <TableCell>{formatDate(bus.departure_time)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => void deleteBus(bus._id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
