"use client"

import { useEffect, useState } from "react"
import { Users, Shield, Activity, UserCheck, Link as LinkIcon, Hotel, Bus, BellRing, PhoneCall } from "lucide-react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Stats {
    total_users: number
    moderators: number
    users_as_pilgrims: number
    groups: number
    pending_moderator_requests: number
    total_hotels: number
    total_buses: number
    notifications_sent: number
    active_emergency_calls: number
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

    const rolesData = [
        { name: "Pilgrims", value: stats?.users_as_pilgrims || 0 },
        { name: "Moderators", value: stats?.moderators || 0 }
    ]
    const COLORS = ['#8884d8', '#00c49f']

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                <Link href="/dashboard/groups">
                    <Button variant="secondary" className="gap-2">
                        <Users className="h-4 w-4" /> Create New Group
                    </Button>
                </Link>
                <Link href="/dashboard/resources">
                    <Button variant="secondary" className="gap-2">
                        <Hotel className="h-4 w-4" /> Manage Hotels
                    </Button>
                </Link>
                <Link href="/dashboard/resources">
                    <Button variant="secondary" className="gap-2">
                        <Bus className="h-4 w-4" /> Manage Buses
                    </Button>
                </Link>
            </div>

            {/* Main Stats */}
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
                    title="Pilgrim Users"
                    value={stats?.users_as_pilgrims || 0}
                    icon={UserCheck}
                    description="Users registered as pilgrims"
                />
                <StatsCard
                    title="Active Groups"
                    value={stats?.groups || 0}
                    icon={Activity}
                    description="Pilgrim groups"
                />
            </div>

            {/* Additional Resources & Logistics Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Hotels"
                    value={stats?.total_hotels || 0}
                    icon={Hotel}
                    description="Registered accommodations"
                />
                <StatsCard
                    title="Total Buses"
                    value={stats?.total_buses || 0}
                    icon={Bus}
                    description="Active transport vehicles"
                />
            </div>

            {/* Charts Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Roles Breakdown</CardTitle>
                        <CardDescription>Composition of users across different roles</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={rolesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {rolesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, description, trend }: any) {
    return (
        <Card className={trend === 'critical' && value > 0 ? "border-red-500 bg-red-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${trend === 'critical' && value > 0 ? "text-red-500 font-bold animate-pulse" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${trend === 'critical' && value > 0 ? "text-red-600" : ""}`}>{value}</div>
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
