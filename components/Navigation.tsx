import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navigation() {
    const pathname = usePathname()

    const links = [
        { href: "/", label: "Hjem" },
        { href: "/portal", label: "Portal" },
        { href: "/analyze", label: "Analyser" },
        { href: "/editor", label: "Editor" },
    ]

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center space-x-4">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === link.href
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    )
}