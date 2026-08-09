import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { challenges, getChallenge } from "@/lib/data";
import { categoryLabel, challengeZipHref, formatBytes, writeupHref } from "@/lib/format";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return challenges.map((challenge) => ({ slug: challenge.id.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const challenge = getChallenge(slug.join("/"));
  return challenge ? { title: challenge.name, description: `DEF CON ${challenge.year} ${categoryLabel(challenge.category)} challenge.` } : {};
}

export default async function ChallengePage({ params }: Props) {
  const { slug } = await params;
  const challenge = getChallenge(slug.join("/"));
  if (!challenge) notFound();

  return (
    <div className="page-shell inner-page challenge-page">
      <Link href={`/events/${challenge.year}`} className="back-link">← DEF CON {challenge.year}</Link>
      <section className="challenge-hero">
        <div className="challenge-breadcrumb"><span>DC{String(challenge.year).slice(-2)}</span><span>{categoryLabel(challenge.category)}</span><span>{challenge.stage}</span></div>
        <h1>{challenge.name.replaceAll("_", " ")}</h1>
        <div className="challenge-actions">
          <span className={`status status-${challenge.status}`}>{challenge.status}</span>
          <a href={challenge.upstream_url} target="_blank" rel="noreferrer">Original files ↗</a>
          {challenge.artifacts.length > 0 && <a className="download-button" href={challengeZipHref(challenge.id)} download>Download ZIP · {formatBytes(challenge.total_bytes)} ↓</a>}
          {challenge.writeup && <Link href={writeupHref(challenge.id)}>Read write-up →</Link>}
        </div>
      </section>

      <div className="challenge-layout">
        <article className="question-panel">
          <span className="eyebrow">THE QUESTION</span>
          <div className="markdown">
            {challenge.prompt ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{challenge.prompt}</ReactMarkdown> : <p>The upstream archive does not include a written prompt for this challenge. Inspect the supplied artifacts to reconstruct the objective.</p>}
          </div>
        </article>
        <aside className="artifact-panel">
          <div className="artifact-summary"><span>Artifacts</span><strong>{challenge.artifacts.length}</strong><span>Total size</span><strong>{formatBytes(challenge.total_bytes)}</strong></div>
          <div className="artifact-list">
            {challenge.artifacts.length ? challenge.artifacts.map((artifact) => <div key={artifact.path}><code>{artifact.path}</code><span>{formatBytes(artifact.bytes)}</span></div>) : <p>No separate artifact files are listed.</p>}
          </div>
          <code className="fetch-command">python3 tools/archive.py fetch {challenge.id}</code>
        </aside>
      </div>

      <section className={`writeup-callout ${challenge.writeup ? "has-writeup" : ""}`}>
        <div><span className="eyebrow">WRITE-UP</span><h2>{challenge.writeup ? "Solved, documented, reproducible." : "The solution is still unwritten."}</h2></div>
        {challenge.writeup ? <Link href={writeupHref(challenge.id)}>Open the full write-up →</Link> : <p>When this room is solved, the reasoning, code, dead ends, and flag will appear here.</p>}
      </section>
    </div>
  );
}
