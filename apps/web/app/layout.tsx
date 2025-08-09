import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cerium",
  description: "Bringing scattered engineering knowledge to the surface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
