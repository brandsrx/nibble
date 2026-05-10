import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nibble · Transferencia P2P",
  description: "Comparte archivos directamente entre dispositivos, sin servidores intermedios.",
};

export default function SwapLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
