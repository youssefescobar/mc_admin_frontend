"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Ban, MoreHorizontal } from "lucide-react"
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

export default function ModeratorsPage() {
    const [moderators, setModerators] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        password: ""
    })

    const fetchModerators = async () => {
        try {
            const res = await api.get('/users?role=moderator')
            if (res.data.success) {
                setModerators(res.data.data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load moderators")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchModerators()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await api.post('/moderators', formData)
            if (res.data.success) {
                toast.success("Moderator created successfully")
                setModalOpen(false)
                fetchModerators()
                setFormData({ full_name: "", email: "", phone_number: "", password: "" })
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create moderator")
        }
    }

    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleteForce, setDeleteForce] = useState(false)

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            const endpoint = deleteForce ? `/moderators/${deleteId}/force` : `/moderators/${deleteId}`
            const res = await api.delete(endpoint)

            if (res.data.success) {
                toast.success(deleteForce ? "Permanently deleted" : "Deactivated")
                fetchModerators()
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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Moderators</h1>
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Moderator
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Moderator</DialogTitle>
                            <DialogDescription>
                                Create a new moderator account directly.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    required
                                    placeholder="+9665..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Account</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
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
                        ) : moderators.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">No moderators found</TableCell>
                            </TableRow>
                        ) : (
                            moderators.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell className="font-medium">{user.full_name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone_number}</TableCell>
                                    <TableCell>
                                        {user.active ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inactive</Badge>
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
                                ? "This action cannot be undone. This will permanently delete the moderator account."
                                : "This will deactivate the moderator account. They will no longer be able to login."}
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
        </div>
    )
}
