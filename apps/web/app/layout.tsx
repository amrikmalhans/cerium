import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { openSans, crimsonText, jetBrainsMono, inter, geist, geistMono } from "@/lib/fonts";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.variable} ${crimsonText.variable} ${jetBrainsMono.variable} ${inter.variable} ${geist.variable} ${geistMono.variable} font-mono antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
