import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Productivity App",
  description:
    "A journal, garden, gym and food log that lives entirely in your own browser. No account, no server, no one reading your entries.",
};

export const viewport: Viewport = {
  themeColor: "#f5d877",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
