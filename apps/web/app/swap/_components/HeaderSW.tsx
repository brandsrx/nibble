"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SendHorizontal,
  History,
  Settings,
  ShieldCheck,
  BookOpen,
  LayoutDashboard,
  Users,
  User2,
  LogOut,
  Bell,
  Menu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = {
  main: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Transferir", url: "/transfer", icon: SendHorizontal },
    { title: "Historial", url: "/history", icon: History },
    { title: "Dispositivos", url: "/nodes", icon: Users },
  ],
  support: [
    { title: "Docs", url: "/docs", icon: BookOpen },
    { title: "Seguridad", url: "/security", icon: ShieldCheck },
  ],
};

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all">
      <div className=" flex h-16 items-center justify-between px-4 sm:px-8">
        {/* LOGO AREA */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm shadow-primary/20">
              <SendHorizontal className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Nibble
            </span>
          </Link>

          {/* MAIN NAV (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.main.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  pathname === item.url
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    pathname === item.url
                      ? "text-primary"
                      : "opacity-70 group-hover:opacity-100",
                  )}
                />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* SECUNDARY NAV (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 border-r border-border/40 pr-4 mr-2">
            {navigation.support.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <item.icon className="h-4 w-4 opacity-70" />
                {item.title}
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>

          {/* USER PROFILE DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full border border-border/40 bg-muted/50 p-0 hover:bg-muted transition-all"
              >
                <User2 className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 mt-2 rounded-xl"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Ramiro Brandon
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    brandon@bayesacd.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Ajustes de cuenta</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* MOBILE MENU (Trigger) */}
          <Button variant="ghost" size="icon" className="md:hidden rounded-lg">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
