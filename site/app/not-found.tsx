import Link from "next/link";

export default function NotFound() {
  return <div className="page-shell not-found"><span>404 / LOST PACKET</span><h1>This room is not in the archive.</h1><Link href="/">Return to the challenge board →</Link></div>;
}
