import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { challenges } from "@/lib/data";
import { challengeHref, categoryLabel, eventZipHref, formatBytes } from "@/lib/format";

type Props = { params: Promise<{ year: string }> };

export function generateStaticParams() {
  return [...new Set(challenges.map((challenge) => challenge.year))].map((year) => ({ year: String(year) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return { title: `DEF CON ${year}`, description: `Browse every archived DEF CON ${year} CTF challenge.` };
}

export default async function EventPage({ params }: Props) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);
  const eventChallenges = challenges.filter((challenge) => challenge.year === year);
  if (!eventChallenges.length) notFound();
  const categories = [...new Set(eventChallenges.map((challenge) => challenge.category))];
  const solved = eventChallenges.filter((challenge) => challenge.status === "solved").length;
  const eventBytes = eventChallenges.reduce((total, challenge) => total + challenge.total_bytes, 0);

  return (
    <div className="page-shell inner-page">
      <Link href="/" className="back-link">← All events</Link>
      <section className="event-hero">
        <div><span className="eyebrow">DEF CON QUALIFIERS</span><h1>{year}</h1></div>
        <div className="event-actions">
          <div className="event-tally"><strong>{eventChallenges.length}</strong><span>challenges</span><strong>{solved}</strong><span>solved</span></div>
          <a className="download-button" href={eventZipHref(year)} download>Download event files · {formatBytes(eventBytes)} ↓</a>
        </div>
      </section>
      {categories.map((category) => {
        const items = eventChallenges.filter((challenge) => challenge.category === category);
        return (
          <section className="category-section" key={category}>
            <div className="category-title"><h2>{categoryLabel(category)}</h2><span>{items.length}</span></div>
            <div className="event-list">
              {items.map((challenge, index) => (
                <Link href={challengeHref(challenge.id)} className="event-row" key={challenge.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{challenge.name.replaceAll("_", " ")}</strong>
                  <span>{challenge.artifacts.length} files</span>
                  <span className={`status status-${challenge.status}`}>{challenge.status}</span>
                  <span>→</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
