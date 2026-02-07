"use client"

import { useEffect, useState } from "react"
import { Trash2, Ban, MoreHorizontal, Filter } from "lucide-react"
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

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterRole, setFilterRole] = useState("all")

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const query = filterRole !== 'all' ? `?role=${filterRole}` : ''
            const res = await api.get(`/users${query}`)
            if (res.data.success) {
                setUsers(res.data.data)
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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">All Users (God Mode)</h1>

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
                                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'moderator' ? 'secondary' : 'outline'}>
                                            {user.role}
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
        </div>
    )
}
