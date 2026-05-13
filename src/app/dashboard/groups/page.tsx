"use client"

import { useEffect, useState } from "react"
import { Trash2, Users, Settings, Plus } from "lucide-react"
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
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface Hotel {
    _id: string
    name: string
}

interface Bus {
    _id: string
    bus_number: string
    destination: string
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [hotels, setHotels] = useState<Hotel[]>([])
    const [buses, setBuses] = useState<Bus[]>([])
    const [resourceGroup, setResourceGroup] = useState<any | null>(null)
    const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([])
    const [selectedBusIds, setSelectedBusIds] = useState<string[]>([])

    const [createGroupDialog, setCreateGroupDialog] = useState(false)
    const [groupForm, setGroupForm] = useState({ group_name: '' })

    const createGroup = async () => {
        try {
            const res = await api.post('/groups', groupForm)
            if (res.data?.success) {
                toast.success('Group created successfully')
                setCreateGroupDialog(false)
                setGroupForm({ group_name: '' })
                fetchGroups()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create group')
        }
    }

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups')
            if (res.data.success) {
                setGroups(res.data.data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load groups")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
        const fetchResources = async () => {
            try {
                const [hotelsRes, busesRes] = await Promise.all([
                    api.get('/hotels'),
                    api.get('/buses')
                ])
                setHotels(hotelsRes.data?.data || [])
                setBuses(busesRes.data?.data || [])
            } catch (error) {
                console.error(error)
                toast.error('Failed to load hotels/buses')
            }
        }
        void fetchResources()
    }, [])

    const openResourceAssignment = (group: any) => {
        setResourceGroup(group)
        setSelectedHotelIds((group.assigned_hotel_ids || []).map((hotel: any) => hotel._id || hotel))
        setSelectedBusIds((group.assigned_bus_ids || []).map((bus: any) => bus._id || bus))
    }

    const toggleId = (list: string[], id: string): string[] => {
        if (list.includes(id)) return list.filter((item) => item !== id)
        return [...list, id]
    }

    const saveResourceAssignment = async () => {
        if (!resourceGroup) return
        try {
            const res = await api.put(`/groups/${resourceGroup._id}/resources`, {
                hotel_ids: selectedHotelIds,
                bus_ids: selectedBusIds,
            })
            if (res.data?.success) {
                toast.success('Group resources updated')
                setResourceGroup(null)
                fetchGroups()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update group resources')
        }
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            const res = await api.delete(`/groups/${deleteId}`)
            if (res.data.success) {
                toast.success("Group deleted")
                fetchGroups()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete group")
        } finally {
            setDeleteId(null)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Active Groups</h1>
                <Button onClick={() => setCreateGroupDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Group
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Group Name</TableHead>
                            <TableHead>Moderators</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Pilgrims Count</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : groups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">No groups found</TableCell>
                            </TableRow>
                        ) : (
                            groups.map((group) => (
                                <TableRow key={group._id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        {group.group_name}
                                    </TableCell>
                                    <TableCell>
                                        {group.moderator_ids?.map((m: any) => m.full_name).join(", ") || "None"}
                                    </TableCell>
                                    <TableCell>{group.created_by?.full_name || "Unknown"}</TableCell>
                                    <TableCell>{group.pilgrim_ids?.length || 0}</TableCell>
                                    <TableCell>{formatDate(group.createdAt || group.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => openResourceAssignment(group)}>
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setDeleteId(group._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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
                            This action cannot be undone. This will permanently delete the group and remove all data associated with it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Group
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!resourceGroup} onOpenChange={(open) => !open && setResourceGroup(null)}>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Assign Group Resources</DialogTitle>
                        <DialogDescription>
                            Choose which hotels and buses are available for moderators in {resourceGroup?.group_name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Hotels</Label>
                            <div className="space-y-2 rounded-md border p-3">
                                {hotels.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No hotels created yet.</p>
                                ) : hotels.map((hotel) => (
                                    <label key={hotel._id} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={selectedHotelIds.includes(hotel._id)}
                                            onCheckedChange={() => setSelectedHotelIds((prev) => toggleId(prev, hotel._id))}
                                        />
                                        <span>{hotel.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Buses</Label>
                            <div className="space-y-2 rounded-md border p-3">
                                {buses.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No buses created yet.</p>
                                ) : buses.map((bus) => (
                                    <label key={bus._id} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={selectedBusIds.includes(bus._id)}
                                            onCheckedChange={() => setSelectedBusIds((prev) => toggleId(prev, bus._id))}
                                        />
                                        <span>{bus.bus_number} - {bus.destination}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResourceGroup(null)}>Cancel</Button>
                        <Button onClick={saveResourceAssignment}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={createGroupDialog} onOpenChange={setCreateGroupDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Group</DialogTitle>
                        <DialogDescription>
                            Create a new group for pilgrims. A unique 6-character joining code will be automatically generated.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Group Name</Label>
                            <Input
                                placeholder="eg. Cairo Trip A"
                                value={groupForm.group_name}
                                onChange={(e) => setGroupForm(s => ({ ...s, group_name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Group Code</Label>
                            <Input
                                placeholder="eg. CAIRO2026"
                                value={groupForm.group_code}
                                onChange={(e) => setGroupForm(s => ({ ...s, group_code: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateGroupDialog(false)}>Cancel</Button>
                        <Button onClick={createGroup}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
