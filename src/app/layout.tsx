import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import "@/styles/weather.css";

export const metadata: Metadata = {
  title: "Mausam – Personalized Weather Application",
  description: "Real-time, intelligent personalized weather forecast application for mobile and desktop with 30-minute automatic updates, severe alerts, and radar maps.",
  keywords: ["weather", "mausam", "forecast", "radar", "rain", "temperature", "severe alerts", "personalization"],
  authors: [{ name: "Mausam Weather Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0f1e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
