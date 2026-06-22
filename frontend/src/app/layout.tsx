import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CricketGPT – AI Cricket Assistant",
  description: "Your expert AI assistant for cricket stats, rules, live scores, and match analysis.",
  keywords: "cricket, AI, chatbot, cricket stats, match analysis, CricketGPT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
