"use client"

import { useEffect, useState } from "react"
import { Trash2, Ban, MoreHorizontal, Filter, Pencil, Plus } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
    active: boolean
}

interface HotelOption {
    _id: string
    name: string
    rooms: HotelRoom[]
}

interface BusOption {
    _id: string
    bus_number: string
    destination: string
    departure_time: string
}

interface CategoryOption {
    _id: string
    category_key: string
    label: string
    value: string
}

interface UserRecord {
    _id: string
    full_name: string
    email?: string
    user_type?: string
    role?: string
    active: boolean
    created_at: string
    pilgrim_profile?: {
        hotel_id?: HotelOption | string | null
        room_id?: string | null
        bus_id?: BusOption | string | null
        category_assignments?: Record<string, string>
    }
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [filterRole, setFilterRole] = useState("all")

    const [hotels, setHotels] = useState<HotelOption[]>([])
    const [buses, setBuses] = useState<BusOption[]>([])
    const [categories, setCategories] = useState<Record<string, CategoryOption[]>>({})

    const [assignmentUser, setAssignmentUser] = useState<UserRecord | null>(null)
    const [assignmentHotelId, setAssignmentHotelId] = useState<string>("none")
    const [assignmentRoomId, setAssignmentRoomId] = useState<string>("none")
    const [assignmentBusId, setAssignmentBusId] = useState<string>("none")
    const [categorySelections, setCategorySelections] = useState<Record<string, string>>({})
    const [isCreatePilgrimOpen, setIsCreatePilgrimOpen] = useState(false)
    const [createPilgrimData, setCreatePilgrimData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        national_id: '',
        age: '',
        gender: 'none',
        medical_history: '',
        hotel_id: 'none',
        room_id: 'none',
        bus_id: 'none',
    })
    const [createCategorySelections, setCreateCategorySelections] = useState<Record<string, string>>({})

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const query = filterRole !== 'all' ? `?role=${filterRole}` : ''
            const res = await api.get(`/users${query}`)
            if (res.data.success) {
                setUsers(res.data.data as UserRecord[])
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [filterRole])

    const fetchAssignmentOptions = async () => {
        try {
            const res = await api.get('/pilgrims/meta-options')
            const payload = res.data?.data
            setHotels((payload?.hotels || []) as HotelOption[])
            setBuses((payload?.buses || []) as BusOption[])
            setCategories((payload?.categories || {}) as Record<string, CategoryOption[]>)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load assignment options')
        }
    }

    useEffect(() => {
        void fetchAssignmentOptions()
    }, [])

    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleteForce, setDeleteForce] = useState(false)

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            const endpoint = deleteForce ? `/users/${deleteId}/force` : `/users/${deleteId}`
            const res = await api.delete(endpoint)

            if (res.data.success) {
                toast.success(deleteForce ? "Permanently deleted" : "Deactivated")
                fetchUsers()
            }
        } catch (error: any) {
            toast.error("Operation failed")
        } finally {
            setDeleteId(null)
            setDeleteForce(false)
        }
    }

    const openDelete = (id: string, force: boolean) => {
        setDeleteId(id)
        setDeleteForce(force)
    }

    const getRole = (user: UserRecord): string => user.user_type || user.role || 'unknown'

    const openAssignment = (user: UserRecord) => {
        setAssignmentUser(user)

        const hotelIdValue = typeof user.pilgrim_profile?.hotel_id === 'string'
            ? user.pilgrim_profile?.hotel_id
            : user.pilgrim_profile?.hotel_id?._id
        const busIdValue = typeof user.pilgrim_profile?.bus_id === 'string'
            ? user.pilgrim_profile?.bus_id
            : user.pilgrim_profile?.bus_id?._id

        setAssignmentHotelId(hotelIdValue || 'none')
        setAssignmentRoomId(user.pilgrim_profile?.room_id || 'none')
        setAssignmentBusId(busIdValue || 'none')
        setCategorySelections({ ...(user.pilgrim_profile?.category_assignments || {}) })
    }

    const selectedHotel = assignmentHotelId === 'none'
        ? null
        : hotels.find((hotel) => hotel._id === assignmentHotelId) || null

    useEffect(() => {
        if (!selectedHotel) {
            setAssignmentRoomId('none')
            return
        }

        const roomExists = selectedHotel.rooms.some((room) => room._id === assignmentRoomId)
        if (!roomExists) {
            setAssignmentRoomId('none')
        }
    }, [assignmentHotelId, assignmentRoomId, selectedHotel])

    const saveAssignment = async () => {
        if (!assignmentUser) return

        try {
            const payload = {
                hotel_id: assignmentHotelId === 'none' ? null : assignmentHotelId,
                room_id: assignmentRoomId === 'none' ? null : assignmentRoomId,
                bus_id: assignmentBusId === 'none' ? null : assignmentBusId,
                category_assignments: Object.fromEntries(
                    Object.entries(categorySelections).filter(([, value]) => value !== 'none')
                ),
            }

            const res = await api.patch(`/pilgrims/${assignmentUser._id}/profile-assignment`, payload)
            if (res.data?.success) {
                toast.success('Pilgrim assignment saved')
                setAssignmentUser(null)
                fetchUsers()
            }
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
            toast.error(message || 'Failed to save assignment')
        }
    }

    const createSelectedHotel = createPilgrimData.hotel_id === 'none'
        ? null
        : hotels.find((hotel) => hotel._id === createPilgrimData.hotel_id) || null

    useEffect(() => {
        if (!createSelectedHotel) {
            setCreatePilgrimData((prev) => ({ ...prev, room_id: 'none' }))
            return
        }

        const roomExists = createSelectedHotel.rooms.some((room) => room._id === createPilgrimData.room_id)
        if (!roomExists) {
            setCreatePilgrimData((prev) => ({ ...prev, room_id: 'none' }))
        }
    }, [createPilgrimData.hotel_id, createPilgrimData.room_id, createSelectedHotel])

    const handleCreatePilgrim = async () => {
        try {
            const payload = {
                full_name: createPilgrimData.full_name,
                email: createPilgrimData.email,
                phone_number: createPilgrimData.phone_number,
                password: createPilgrimData.password,
                national_id: createPilgrimData.national_id || undefined,
                age: createPilgrimData.age ? Number(createPilgrimData.age) : undefined,
                gender: createPilgrimData.gender === 'none' ? undefined : createPilgrimData.gender,
                medical_history: createPilgrimData.medical_history || undefined,
                hotel_id: createPilgrimData.hotel_id === 'none' ? null : createPilgrimData.hotel_id,
                room_id: createPilgrimData.room_id === 'none' ? null : createPilgrimData.room_id,
                bus_id: createPilgrimData.bus_id === 'none' ? null : createPilgrimData.bus_id,
                category_assignments: Object.fromEntries(
                    Object.entries(createCategorySelections).filter(([, value]) => value !== 'none')
                ),
            }

            const res = await api.post('/pilgrims', payload)
            if (res.data?.success) {
                toast.success('Pilgrim created successfully')
                setIsCreatePilgrimOpen(false)
                setCreatePilgrimData({
                    full_name: '',
                    email: '',
                    phone_number: '',
                    password: '',
                    national_id: '',
                    age: '',
                    gender: 'none',
                    medical_history: '',
                    hotel_id: 'none',
                    room_id: 'none',
                    bus_id: 'none',
                })
                setCreateCategorySelections({})
                fetchUsers()
            }
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
            toast.error(message || 'Failed to create pilgrim')
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">All Users (God Mode)</h1>

                <div className="flex items-center gap-2">
                    <Dialog open={isCreatePilgrimOpen} onOpenChange={setIsCreatePilgrimOpen}>
                        <Button onClick={() => setIsCreatePilgrimOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Pilgrim
                        </Button>
                        <DialogContent className="max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create Pilgrim</DialogTitle>
                                <DialogDescription>
                                    Create pilgrim profile and assign hotel room, bus, and category values.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={createPilgrimData.full_name} onChange={(e) => setCreatePilgrimData((p) => ({ ...p, full_name: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={createPilgrimData.email} onChange={(e) => setCreatePilgrimData((p) => ({ ...p, email: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input value={createPilgrimData.phone_number} onChange={(e) => setCreatePilgrimData((p) => ({ ...p, phone_number: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input type="password" value={createPilgrimData.password} onChange={(e) => setCreatePilgrimData((p) => ({ ...p, password: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>National ID</Label>
                                    <Input value={createPilgrimData.national_id} onChange={(e) => setCreatePilgrimData((p) => ({ ...p, national_id: e.target.value }))} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Age</Label>
                                        <Input type="number" value={createPilgrimData.age} onChange={(e) => setCreatePilgrimData((p) => ({ ...p, age: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Select value={createPilgrimData.gender} onValueChange={(value) => setCreatePilgrimData((p) => ({ ...p, gender: value }))}>
                                            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Not set</SelectItem>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Medical History</Label>
                                    <Input value={createPilgrimData.medical_history} onChange={(e) => setCreatePilgrimData((p) => ({ ...p, medical_history: e.target.value }))} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Hotel</Label>
                                    <Select value={createPilgrimData.hotel_id} onValueChange={(value) => setCreatePilgrimData((p) => ({ ...p, hotel_id: value }))}>
                                        <SelectTrigger><SelectValue placeholder="Select hotel" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No hotel</SelectItem>
                                            {hotels.map((hotel) => (
                                                <SelectItem key={hotel._id} value={hotel._id}>{hotel.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Room</Label>
                                    <Select
                                        value={createPilgrimData.room_id}
                                        onValueChange={(value) => setCreatePilgrimData((p) => ({ ...p, room_id: value }))}
                                        disabled={!createSelectedHotel}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No room</SelectItem>
                                            {(createSelectedHotel?.rooms || [])
                                                .filter((room) => room.active)
                                                .map((room) => (
                                                    <SelectItem key={room._id} value={room._id}>
                                                        {room.room_number}{room.floor ? ` - floor ${room.floor}` : ''}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Bus</Label>
                                    <Select value={createPilgrimData.bus_id} onValueChange={(value) => setCreatePilgrimData((p) => ({ ...p, bus_id: value }))}>
                                        <SelectTrigger><SelectValue placeholder="Select bus" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No bus</SelectItem>
                                            {buses.map((bus) => (
                                                <SelectItem key={bus._id} value={bus._id}>
                                                    {bus.bus_number} - {bus.destination}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {Object.entries(categories).map(([key, options]) => (
                                    <div className="space-y-2" key={key}>
                                        <Label>{key}</Label>
                                        <Select
                                            value={createCategorySelections[key] || 'none'}
                                            onValueChange={(value) => {
                                                setCreateCategorySelections((prev) => ({ ...prev, [key]: value }))
                                            }}
                                        >
                                            <SelectTrigger><SelectValue placeholder={`Select ${key}`} /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Not set</SelectItem>
                                                {options.map((option) => (
                                                    <SelectItem key={option._id} value={option.value}>{option.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreatePilgrimOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreatePilgrim}>Create Pilgrim</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter Role: {filterRole === 'all' ? 'All' : filterRole}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuRadioGroup value={filterRole} onValueChange={setFilterRole}>
                                <DropdownMenuRadioItem value="all">All Users</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="admin">Admins</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="moderator">Moderators</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="pilgrim">Pilgrims</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">No users found</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell className="font-medium">{user.full_name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="capitalize">
                                        <Badge variant={getRole(user) === 'admin' ? 'default' : getRole(user) === 'moderator' ? 'secondary' : 'outline'}>
                                            {getRole(user)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.active ? (
                                            <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
                                        ) : (
                                            <Badge variant="destructive">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{formatDate(user.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                {getRole(user) === 'pilgrim' ? (
                                                    <DropdownMenuItem onClick={() => openAssignment(user)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Assign Hotel/Bus
                                                    </DropdownMenuItem>
                                                ) : null}
                                                <DropdownMenuItem onClick={() => openDelete(user._id, false)}>
                                                    <Ban className="mr-2 h-4 w-4" /> Deactivate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openDelete(user._id, true)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteForce
                                ? "This action cannot be undone. This will permanently delete the user account."
                                : "This will deactivate the user account. They will no longer be able to login."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className={deleteForce ? "bg-red-600 hover:bg-red-700" : ""}>
                            {deleteForce ? "Delete Permanently" : "Deactivate"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!assignmentUser} onOpenChange={(open) => !open && setAssignmentUser(null)}>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Pilgrim Assignment</DialogTitle>
                        <DialogDescription>
                            Assign hotel room, bus, and category values for {assignmentUser?.full_name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Hotel</Label>
                            <Select value={assignmentHotelId} onValueChange={setAssignmentHotelId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select hotel" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No hotel</SelectItem>
                                    {hotels.map((hotel) => (
                                        <SelectItem key={hotel._id} value={hotel._id}>{hotel.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Room</Label>
                            <Select value={assignmentRoomId} onValueChange={setAssignmentRoomId} disabled={!selectedHotel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select room" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No room</SelectItem>
                                    {(selectedHotel?.rooms || [])
                                        .filter((room) => room.active)
                                        .map((room) => (
                                            <SelectItem key={room._id} value={room._id}>
                                                {room.room_number}{room.floor ? ` - floor ${room.floor}` : ''}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Bus</Label>
                            <Select value={assignmentBusId} onValueChange={setAssignmentBusId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select bus" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No bus</SelectItem>
                                    {buses.map((bus) => (
                                        <SelectItem key={bus._id} value={bus._id}>
                                            {bus.bus_number} - {bus.destination} ({new Date(bus.departure_time).toLocaleTimeString()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {Object.entries(categories).map(([key, options]) => (
                            <div className="space-y-2" key={key}>
                                <Label>{key}</Label>
                                <Select
                                    value={categorySelections[key] || 'none'}
                                    onValueChange={(value) => {
                                        setCategorySelections((prev) => ({ ...prev, [key]: value }))
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select ${key}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Not set</SelectItem>
                                        {options.map((option) => (
                                            <SelectItem key={option._id} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignmentUser(null)}>Cancel</Button>
                        <Button onClick={saveAssignment}>Save Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
