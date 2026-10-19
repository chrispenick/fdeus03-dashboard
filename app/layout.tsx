import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "FDEUS03 Capstone Dashboard", description: "FedEx FDE cohort capstone teams" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header className="top">
          <div className="in">
            <Link href="/" className="brand">FDEUS03 <b>Capstone</b></Link>
            <nav>
              <Link href="/">Teams</Link>
              <Link href="/schedule">Schedule</Link>
              <Link href="/leaderboard">Results</Link>
              <Link href="/admin">Admin</Link>
            </nav>
            <ThemeToggle />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
