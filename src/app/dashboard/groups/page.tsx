"use client"

import { useEffect, useState } from "react"
import { Trash2, Users } from "lucide-react"
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

export default function GroupsPage() {
    const [groups, setGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)

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
    }, [])

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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => setDeleteId(group._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
        </div>
    )
}
