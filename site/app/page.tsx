import { Explorer } from "@/components/Explorer";
import { challenges, eventSummaries } from "@/lib/data";
import { archiveZipHref, formatBytes } from "@/lib/format";

export default function Home() {
  const solved = challenges.filter((challenge) => challenge.status === "solved").length;
  const archiveBytes = challenges.reduce((total, challenge) => total + challenge.total_bytes, 0);

  return (
    <>
      <section className="hero page-shell">
        <div className="hero-kicker"><span>PUBLIC LOG</span><span>2018—2026</span></div>
        <h1><span>{challenges.length} rooms.</span><br />One flag at a time.</h1>
        <div className="hero-footer">
          <p>
            A methodical run through every archived DEF CON CTF challenge—questions,
            artifacts, working notes, and original write-ups in one place.
          </p>
          <div className="hero-downloads">
            <div className="hero-progress" aria-label={`${solved} of ${challenges.length} challenges solved`}>
              <strong>{String(solved).padStart(3, "0")}</strong>
              <span>/ {challenges.length} solved</span>
            </div>
            <a className="download-button" href={archiveZipHref} download>Download all files · {formatBytes(archiveBytes)} ↓</a>
          </div>
        </div>
      </section>

      <section className="marquee" aria-hidden="true">
        <div>CRYPTO · PWN · REVERSE · WEB · MISC · FORENSICS · CRYPTO · PWN · REVERSE · WEB · MISC · FORENSICS ·</div>
      </section>

      <section className="page-shell section-block" id="events">
        <div className="section-heading">
          <div><span className="eyebrow">01 / EVENTS</span><h2>The archive, by year</h2></div>
          <p>Eight preserved qualifier sets. Open an event to see its complete challenge board.</p>
        </div>
        <div className="event-grid">
          {eventSummaries.map((event, index) => (
            <a className="event-card" href={`/events/${event.year}`} key={event.year}>
              <div className="event-card-top"><span>DC{String(event.year).slice(-2)}</span><span>{String(index + 1).padStart(2, "0")}</span></div>
              <strong>{event.year}</strong>
              <div className="event-card-bottom"><span>{event.count} challenges</span><span>{event.solved} solved →</span></div>
            </a>
          ))}
        </div>
      </section>

      <section className="page-shell section-block" id="challenges">
        <div className="section-heading">
          <div><span className="eyebrow">02 / CHALLENGES</span><h2>Find the next flag</h2></div>
          <p>Search the questions, narrow by event or category, and jump straight into the workspace.</p>
        </div>
        <Explorer initialChallenges={challenges} />
      </section>
    </>
  );
}
