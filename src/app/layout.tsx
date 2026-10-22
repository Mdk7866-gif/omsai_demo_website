import type { Metadata } from "next";
import { DemoShell } from "@/components/demo";
import "./globals.css";
import "./plain.css";
export const metadata: Metadata = {
  title: "Omsai | Shop accounts",
  description:
    "Omsai Fertiliser, pesticides and seeds — interactive shop management demo.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DemoShell>{children}</DemoShell>
      </body>
    </html>
  );
}
