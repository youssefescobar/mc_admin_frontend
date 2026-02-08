"use client"

import { useEffect, useState } from "react"
import { Check, X, MoreHorizontal } from "lucide-react"
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

export default function RequestsPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchRequests = async () => {
        try {
            const res = await api.get('/moderator-requests')
            if (res.data.success) {
                setRequests(res.data.data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load requests")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            // Correct endpoint depends on admin_routes.js:  /moderator-requests/:id/approve
            const endpoint = `/moderator-requests/${id}/${action}`
            const res = await api.post(endpoint)

            if (res.data.success) {
                toast.success(`Request ${action}ed`)
                fetchRequests()
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Moderator Requests</h1>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pilgrim Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>National ID</TableHead>
                            <TableHead>Email Verified</TableHead>
                            <TableHead>Requested At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">No pending requests</TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req._id}>
                                    <TableCell className="font-medium">
                                        {req.pilgrim_id?.full_name || "Unknown Pilgrim"}
                                    </TableCell>
                                    <TableCell>{req.pilgrim_id?.email || "N/A"}</TableCell>
                                    <TableCell>{req.pilgrim_id?.national_id || "N/A"}</TableCell>
                                    <TableCell>
                                        {req.pilgrim_id?.email_verified ? (
                                            <span className="text-green-600 font-medium">✓ Verified</span>
                                        ) : (
                                            <span className="text-red-600 font-medium">✗ Not Verified</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{formatDate(req.created_at)}</TableCell>
                                    <TableCell className="capitalize">{req.status}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                onClick={() => handleAction(req._id, 'approve')}
                                                title="Approve"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                onClick={() => handleAction(req._id, 'reject')}
                                                title="Reject"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
