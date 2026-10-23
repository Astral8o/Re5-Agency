import type { Metadata } from "next";
import BlogChrome from "../blog/Chrome";
import Demo from "./Demo";
import "../home.css";
import "./demo.css";

export const metadata: Metadata = {
  title: "See AI in Action | RE5 Agency",
  description:
    "Try an interactive demo: see how smart forecasting flags products about to run out, suggests reorder quantities and drafts customer follow-ups.",
  alternates: { canonical: "/see-ai-in-action" },
};

export default function Page() {
  return (
    <BlogChrome>
      <main className="h">
        <Demo />
      </main>
    </BlogChrome>
  );
}
