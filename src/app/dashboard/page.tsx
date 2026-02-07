"use client"

import { useEffect, useState } from "react"
import { Users, UserPlus, Shield, Activity } from "lucide-react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Stats {
    total_users: number
    moderators: number
    users_as_pilgrims: number
    groups: number
    pending_moderator_requests: number
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/stats')
                if (res.data.success) {
                    setStats(res.data.stats)
                }
            } catch (error) {
                console.error("Failed to fetch stats", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return <DashboardSkeleton />
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Users"
                    value={stats?.total_users || 0}
                    icon={Users}
                    description="All registered accounts"
                />
                <StatsCard
                    title="Active Moderators"
                    value={stats?.moderators || 0}
                    icon={Shield}
                    description="Staff members"
                />
                <StatsCard
                    title="Pending Requests"
                    value={stats?.pending_moderator_requests || 0}
                    icon={UserPlus}
                    description="Awaiting approval"
                />
                <StatsCard
                    title="Active Groups"
                    value={stats?.groups || 0}
                    icon={Activity}
                    description="Pilgrim groups"
                />
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, description }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
