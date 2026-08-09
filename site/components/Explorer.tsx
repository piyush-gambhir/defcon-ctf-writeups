"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Challenge, ChallengeStatus } from "@/lib/types";
import { challengeHref, categoryLabel } from "@/lib/format";

const PAGE_SIZE = 24;

function promptSummary(prompt: string) {
  return prompt
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`#>*_|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function Explorer({ initialChallenges }: { initialChallenges: Challenge[] }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<ChallengeStatus | "all">("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const years = useMemo(() => [...new Set(initialChallenges.map((item) => item.year))].sort((a, b) => b - a), [initialChallenges]);
  const categories = useMemo(() => [...new Set(initialChallenges.map((item) => item.category))].sort(), [initialChallenges]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialChallenges.filter((challenge) => {
      const searchable = `${challenge.name} ${challenge.prompt} ${challenge.category}`.toLowerCase();
      return (!needle || searchable.includes(needle))
        && (year === "all" || challenge.year === Number(year))
        && (category === "all" || challenge.category === category)
        && (status === "all" || challenge.status === status);
    }).sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
  }, [initialChallenges, query, year, category, status]);

  function resetVisible() { setVisible(PAGE_SIZE); }

  return (
    <div className="explorer">
      <div className="filters">
        <label className="search-field">
          <span>Search</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); resetVisible(); }} placeholder="challenge, phrase, technique…" />
        </label>
        <label><span>Event</span><select value={year} onChange={(event) => { setYear(event.target.value); resetVisible(); }}><option value="all">All years</option>{years.map((value) => <option value={value} key={value}>DEF CON {value}</option>)}</select></label>
        <label><span>Category</span><select value={category} onChange={(event) => { setCategory(event.target.value); resetVisible(); }}><option value="all">All categories</option>{categories.map((value) => <option value={value} key={value}>{categoryLabel(value)}</option>)}</select></label>
        <label><span>Status</span><select value={status} onChange={(event) => { setStatus(event.target.value as ChallengeStatus | "all"); resetVisible(); }}><option value="all">Any status</option><option value="todo">Not started</option><option value="solving">In progress</option><option value="solved">Solved</option><option value="blocked">Blocked</option></select></label>
      </div>

      <div className="results-line"><span>{filtered.length} matches</span><span>sorted newest first</span></div>
      <div className="challenge-grid">
        {filtered.slice(0, visible).map((challenge) => (
          <Link className="challenge-card" href={challengeHref(challenge.id)} key={challenge.id}>
            <div className="challenge-meta"><span>DC{String(challenge.year).slice(-2)}</span><span className={`status status-${challenge.status}`}>{challenge.status}</span></div>
            <h3>{challenge.name.replaceAll("_", " ")}</h3>
            <p>{promptSummary(challenge.prompt) || "Original prompt preserved in the upstream challenge package."}</p>
            <div className="challenge-bottom"><span>{categoryLabel(challenge.category)}</span><span>{challenge.artifacts.length} files ↗</span></div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty-state"><strong>No matching room.</strong><p>Try removing a filter or searching for a broader technique.</p></div>}
      {visible < filtered.length && <button className="load-more" onClick={() => setVisible((value) => value + PAGE_SIZE)}>Load {Math.min(PAGE_SIZE, filtered.length - visible)} more <span>↓</span></button>}
    </div>
  );
}
