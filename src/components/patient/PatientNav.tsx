"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Ticket, Heart, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientNavProps {
  patientName: string;
}

export default function PatientNav({ patientName }: PatientNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const links = [
    { href: "/patient/home", label: "Home", icon: Home },
    { href: "/patient/tokens", label: "My Tokens", icon: Ticket },
    { href: "/patient/favourites", label: "Favourites", icon: Heart },
    { href: "/patient/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">Reserve Your Token</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">Hi, {patientName.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="flex justify-around py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors",
                pathname === link.href ? "text-green-600" : "text-gray-400"
              )}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-xs">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop side nav */}
      <div className="hidden md:block fixed left-0 top-14 bottom-0 w-56 bg-white border-r border-gray-200 p-4">
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
