import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoomMorph AI",
  description: "AI-powered interior redesign and 360 room visualization.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
