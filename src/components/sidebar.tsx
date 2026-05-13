"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, User, Shield, BarChart3, LogOut, Menu, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { SheetTitle } from "@/components/ui/sheet"

const sidebarItems = [
    { href: "/dashboard", icon: BarChart3, label: "Overview" },
    { href: "/dashboard/moderators", icon: Shield, label: "Moderators" },
    { href: "/dashboard/groups", icon: Users, label: "Groups" },
    { href: "/dashboard/users", icon: User, label: "All Users" },
    { href: "/dashboard/resources", icon: Building2, label: "Resources" },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = () => {
        Cookies.remove("admin_token")
        router.push("/login")
    }

    return (
        <div className="flex h-screen flex-col border-r bg-gray-100/40 lg:w-64">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Shield className="h-6 w-6" />
                    <span className="">Munawwara Admin</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === item.href
                                    ? "bg-muted text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="border-t p-4">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <VisuallyHidden>
                    <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <Sidebar />
            </SheetContent>
        </Sheet>
    )
}
