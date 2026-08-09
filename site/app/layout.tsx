import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);

  return {
    metadataBase: base,
    title: {
      default: "DEF CON CTF — Solve Them All",
      template: "%s // DEF CON CTF",
    },
    description: "A public journey through 126 archived DEF CON CTF challenges, with progress notes, original solutions, and write-ups.",
    openGraph: {
      type: "website",
      title: "DEF CON CTF — Solve Them All",
      description: "126 archived challenges. One flag at a time.",
      images: [new URL("/og.png", base).toString()],
    },
    twitter: {
      card: "summary_large_image",
      title: "DEF CON CTF — Solve Them All",
      description: "126 archived challenges. One flag at a time.",
      images: [new URL("/og.png", base).toString()],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="DEF CON CTF archive home">
            <span className="brand-mark">DC</span>
            <span>CTF / ARCHIVE</span>
          </Link>
          <nav aria-label="Primary navigation">
            <Link href="/#events">Events</Link>
            <Link href="/#challenges">Challenges</Link>
            <a href="https://github.com/piyush-gambhir/defcon-ctf-writeups" target="_blank" rel="noreferrer">GitHub ↗</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>Independent learning project. Not affiliated with DEF CON.</p>
          <p><span className="signal-dot" /> Archive synced from sajjadium/ctf-archives</p>
        </footer>
      </body>
    </html>
  );
}
