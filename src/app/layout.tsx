import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Air Force Training Intelligence Platform",
  description: "Advanced AI-driven training system for aircraft systems, digital twins, and mission simulations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
