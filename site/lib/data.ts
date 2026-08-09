import content from "@/data/content.json";
import type { Challenge } from "./types";

export const challenges = content.challenges as Challenge[];

export const eventSummaries = [...new Set(challenges.map((challenge) => challenge.year))]
  .sort((a, b) => b - a)
  .map((year) => {
    const items = challenges.filter((challenge) => challenge.year === year);
    return {
      year,
      count: items.length,
      solved: items.filter((challenge) => challenge.status === "solved").length,
      categories: [...new Set(items.map((challenge) => challenge.category))],
    };
  });

export function getChallenge(id: string) {
  return challenges.find((challenge) => challenge.id === id);
}
