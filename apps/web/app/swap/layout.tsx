import type { Metadata } from "next";
import { AppSidebar } from "./_components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
    title: "Intercambio de archivos ",
    description: "Intercambia archivos sin limites con cualquiera persona en la red ",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>
            <TooltipProvider>
                <SidebarProvider>
                <AppSidebar/>
                    <main>{children}</main>
            </SidebarProvider>
            </TooltipProvider>
        </>

    );
}
