"use client";

import * as React from "react";
import { 
  SendHorizontal, 
  History, 
  Settings, 
  ShieldCheck, 
  BookOpen, 
  LayoutDashboard,
  Users,
  ChevronUp,
  User2,
  LogOut
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

/* =========================
   NAV CONFIG
========================= */

const navigation = {
  main: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Transferir", url: "/transfer", icon: SendHorizontal },
    { title: "Historial", url: "/history", icon: History },
    { title: "Dispositivos", url: "/nodes", icon: Users },
  ],
  support: [
    { title: "Documentación", url: "/docs", icon: BookOpen },
    { title: "Seguridad", url: "/security", icon: ShieldCheck },
    { title: "Ajustes", url: "/settings", icon: Settings },
  ]
};

/* =========================
   COMPONENT
========================= */

export function AppSidebar() {
  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-border/30 bg-background/60 backdrop-blur-xl"
    >

      {/* ================= HEADER ================= */}
      <SidebarHeader className="h-16 flex items-center border-b border-border/30 px-4">
        <div className="flex items-center gap-3">
          
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <SendHorizontal className="h-5 w-5" />
          </div>

          <span className="font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            Nibble
          </span>
        </div>
      </SidebarHeader>

      {/* ================= CONTENT ================= */}
      <SidebarContent className="px-2 py-3">

        {/* CORE */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Core
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="
                      group flex items-center gap-3 rounded-xl px-3 py-2
                      text-muted-foreground
                      hover:bg-muted hover:text-foreground
                      transition-all duration-200
                    "
                  >
                    <a href={item.url}>
                      <item.icon className="h-[18px] w-[18px] opacity-80 group-hover:opacity-100 transition" />
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SUPPORT */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Sistema
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.support.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="
                      group flex items-center gap-3 rounded-xl px-3 py-2
                      text-muted-foreground
                      hover:bg-muted hover:text-foreground
                      transition-all duration-200
                    "
                  >
                    <a href={item.url}>
                      <item.icon className="h-[18px] w-[18px] opacity-80 group-hover:opacity-100 transition" />
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ================= FOOTER ================= */}
      <SidebarFooter className="border-t border-border/30 p-3">

        <SidebarMenu>
          <SidebarMenuItem>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="
                    flex h-12 w-full items-center justify-between rounded-xl
                    hover:bg-muted transition
                  "
                >
                  {/* USER */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      RB
                    </div>

                    <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-medium leading-none">
                        Ramiro B.
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Nibble Account
                      </span>
                    </div>
                  </div>

                  <ChevronUp className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] min-w-56 rounded-xl p-2"
              >
                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer">
                  <User2 className="h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-destructive focus:bg-destructive/10">
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}