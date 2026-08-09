export type ChallengeStatus = "todo" | "solving" | "solved" | "blocked";

export type Artifact = {
  path: string;
  bytes: number;
};

export type Writeup = {
  title: string;
  body: string;
} | null;

export type Challenge = {
  id: string;
  year: number;
  stage: string;
  category: string;
  name: string;
  prompt: string;
  artifacts: Artifact[];
  file_count: number;
  total_bytes: number;
  upstream_path: string;
  upstream_url: string;
  workspace: string;
  status: ChallengeStatus;
  writeup: Writeup;
};
