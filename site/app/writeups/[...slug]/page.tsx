import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { challenges, getChallenge } from "@/lib/data";
import { challengeHref, categoryLabel } from "@/lib/format";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return challenges.filter((challenge) => challenge.writeup).map((challenge) => ({ slug: challenge.id.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const challenge = getChallenge(slug.join("/"));
  return challenge?.writeup ? { title: `${challenge.name} write-up`, description: `Solution notes for the DEF CON ${challenge.year} challenge ${challenge.name}.` } : {};
}

export default async function WriteupPage({ params }: Props) {
  const { slug } = await params;
  const challenge = getChallenge(slug.join("/"));
  if (!challenge?.writeup) notFound();

  return (
    <div className="page-shell inner-page writeup-page">
      <Link href={challengeHref(challenge.id)} className="back-link">← Back to question</Link>
      <header className="writeup-header">
        <span className="eyebrow">SOLUTION LOG / DC{String(challenge.year).slice(-2)} / {categoryLabel(challenge.category)}</span>
        <h1>{challenge.writeup.title || challenge.name.replaceAll("_", " ")}</h1>
        <p>Original notes, reproducible commands, and lessons from the solve.</p>
      </header>
      <article className="markdown writeup-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{challenge.writeup.body}</ReactMarkdown></article>
    </div>
  );
}
