# Remote Bindings During Local Development

## Goal

Make `npm run dev` use the existing production Cloudflare D1 database and R2
bucket directly. The project has one administrator, so local CMS changes are
intended to affect the same data and uploaded files used by the deployed site.

## Configuration

Set `remote: true` on the existing `DB` entry in `d1_databases` and on the
existing `PORTFOLIO_ASSETS` entry in `r2_buckets` inside `wrangler.jsonc`.
Binding names, resource names, resource IDs, migration paths, and deployment
configuration remain unchanged.

Per-binding configuration is preferred over the Vite plugin's global
`remoteBindings` option. It documents exactly which resources are remote and
does not automatically expose future bindings to local development.

## Runtime Behavior

During `npm run dev`, Worker code continues to receive the bindings under the
same `DB` and `PORTFOLIO_ASSETS` names. Reads, CMS writes, session records,
login throttling, asset metadata, uploads, and deletions operate on the remote
resources. Local `.dev.vars` continues to provide administrator credentials.

Production builds and deployments continue to use the same resources. The
change only controls how Wrangler resolves the two bindings during local
development.

## Safety and Documentation

The local-development section of `README.md` will state that `npm run dev`
connects to production D1 and R2 and that edits are immediately visible to the
deployed application. Local D1 migration commands are not part of this
workflow; schema changes must continue to use the explicitly remote migration
command.

No production data will be changed as part of implementation or verification.

## Verification

Add configuration assertions that require `remote: true` for both bindings.
Run the focused configuration test, the existing test suite relevant to the
Cloudflare build output, and a Wrangler configuration/build validation. A dev
server smoke test may confirm that the Worker starts, but it must not issue
write requests.
