# Node upgrade verification

Reviewed against upstream main at `3d6e4f6` on 26 October 2026.

Node 26.12.1, stable vinext 1.3.0 and an explicit TypeScript 7 CLI replace the older tooling. TypeScript 6 stays for typed ESLint APIs; ESLint 9 satisfies the React plugin peer range. Existing security floors are preserved, with a bounded fflate 0.7.5 override for the new build dependency chain.

Clean npm installation, lint, types, build, four Python catalog tests and two SSR tests pass. SSR tests now use local workerd because the Cloudflare build imports Worker-only modules. An isolated browser against the real local Worker verifies archive hydration, loading more entries, empty and single-match search, challenge navigation and event navigation without page errors or external requests. No challenge binaries were executed.

Full and production audits report zero advisories. No deployment or external provider calls were made. These checks demonstrate working current tooling and deployed-runtime-style validation, not a measured speed improvement.
