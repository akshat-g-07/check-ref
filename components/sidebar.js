"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Clock, FolderOpen, Menu, Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Create Ref", href: "/dashboard/create", icon: Plus },
  { name: "Read Ref", href: "/dashboard/read", icon: BookOpen },
  { name: "Crons", href: "/dashboard/crons", icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
          className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out sm:relative sm:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="sm:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileMenu}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Header */}
        <div className="p-6 pb-4">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>

        {/* Navigation */}
        <nav className="px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
