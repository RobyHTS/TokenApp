"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Hospital, LayoutDashboard, Users, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface HospitalNavProps {
  hospitalName: string;
}

export default function HospitalNav({ hospitalName }: HospitalNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const links = [
    { href: "/hospital/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/hospital/doctors", label: "Doctors", icon: Users },
    { href: "/hospital/revenue", label: "Revenue", icon: BarChart3 },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Hospital className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm truncate max-w-[180px]">{hospitalName}</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
