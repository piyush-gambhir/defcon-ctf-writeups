import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the challenge archive", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>DEF CON CTF — Solve Them All<\/title>/i);
  assert.match(html, /126(?:<!-- -->)? rooms\./i);
  assert.match(html, /The archive, by year/i);
  assert.match(html, /Find the next flag/i);
  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders an event and challenge route", async () => {
  const eventResponse = await render("/events/2025");
  assert.equal(eventResponse.status, 200);
  assert.match(await eventResponse.text(), /DEF CON QUALIFIERS/i);

  const challengeResponse = await render("/challenges/2025/quals/uncategorized/NautilusInstituteContinuousIntegrationAndContinuousDelivery");
  assert.equal(challengeResponse.status, 200);
  assert.match(await challengeResponse.text(), /THE QUESTION/i);
});
