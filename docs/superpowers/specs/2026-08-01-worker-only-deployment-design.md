# Worker-Only Deployment Design

**Date:** 2026-08-01

## Goal

Make the public Cloudflare Worker the only supported deployment target for the
portfolio. Stop publishing or linking to the private GPT Sites deployment at
`waranchai-fullstack-portfolio.vjgroove.chatgpt.site`.

## Deployment Architecture

- The public application remains at
  `https://waranchai-portfolio.newforico-9ea.workers.dev/`.
- `npm run deploy:cloudflare` remains the production deployment command.
- Cloudflare D1 binding `DB` and R2 binding `PORTFOLIO_ASSETS` remain unchanged.
- GitHub `main` remains the source branch for production changes.
- GPT Sites is no longer part of the build, verification, release, or handoff
  workflow.

## Repository Changes

- Remove `.openai/hosting.json`. Its presence automatically selects the Sites
  publishing workflow, which conflicts with Worker-only deployment.
- Update current deployment guidance in `README.md` to describe Cloudflare
  Worker secrets and deployment instead of Sites environment variables.
- Add a small executable repository contract that fails if
  `.openai/hosting.json` is restored or active documentation directs the user to
  deploy the production portfolio through GPT Sites.
- Preserve historical design and implementation records under
  `docs/superpowers/`; they describe how earlier versions were produced and are
  not active deployment instructions.

## Existing GPT Sites Deployment

The existing Sites URL is private and may continue to show the OpenAI login
screen. It is no longer a supported portfolio URL and will not be redeployed or
returned as a deliverable. No application data, D1 schema, R2 objects, or Worker
bindings are deleted.

## Verification

- The repository contract confirms `.openai/hosting.json` is absent.
- Unit, integration, build, and lint checks pass.
- `git status` is clean and `main` matches `origin/main` after the push.
- The public Worker homepage, deployed CSS, and self-hosted font asset return
  HTTP 200 after the documentation/configuration change.

## Non-Goals

- Do not delete or migrate D1 or R2 data.
- Do not change portfolio content, UI, admin behavior, authentication, or APIs.
- Do not create another hosting target or custom domain.
- Do not deploy a new GPT Sites version.
