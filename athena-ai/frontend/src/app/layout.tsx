import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Athena AI — Decision Intelligence Platform",
  description: "Autonomous multi-agent COO for enterprise operations. FAR AWAY 2026 Hackathon.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-holographic">{children}</body>
    </html>
  );
}