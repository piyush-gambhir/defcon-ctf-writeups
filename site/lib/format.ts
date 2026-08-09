export function categoryLabel(category: string) {
  if (category === "pwn") return "Binary exploitation";
  if (category === "rev") return "Reverse engineering";
  if (category === "web") return "Web exploitation";
  if (category === "crypto") return "Cryptography";
  if (category === "misc") return "Miscellaneous";
  return "Uncategorized";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function challengeHref(id: string) {
  return `/challenges/${id.split("/").map(encodeURIComponent).join("/")}`;
}

export function writeupHref(id: string) {
  return `/writeups/${id.split("/").map(encodeURIComponent).join("/")}`;
}
