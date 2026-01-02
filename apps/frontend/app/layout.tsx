import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cerium Chat",
  description: "Chat with OpenAI models",
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

