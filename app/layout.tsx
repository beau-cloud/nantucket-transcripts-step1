import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Source Government Transcripts — Diagnostics",
  description: "Step 1: Diagnostics for Nantucket Transcripts Web Plan v1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}