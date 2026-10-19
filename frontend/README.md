# TGFC Frontend

The Next.js frontend for TGFC. For an overview of the whole project, see the [root README](../README.md).

## Requirements

- Node.js and [pnpm](https://pnpm.io/)
- The [backend](../backend/README.md) running locally

## Environment variables

Create a `.env` file in this folder:

```env
API_URL=http://localhost:8000
AUTH_SECRET=
BLOB_READ_WRITE_TOKEN=
```

| Variable | Where to get it |
| -------- | --------------- |
| `API_URL` | The URL of the backend. Locally this is `http://localhost:8000`. |
| `AUTH_SECRET` | Any long random string. Auth.js uses it to encrypt login sessions. Generate one with `npx auth secret` (this writes it to `.env.local`, which also works) or `openssl rand -base64 32`. |
| `BLOB_READ_WRITE_TOKEN` | Only needed for uploading profile pictures. In the [Vercel dashboard](https://vercel.com/dashboard), open **Storage**, create a **Blob** store, then copy the token from its **.env.local** tab. |
| `BACKEND_INTERNAL_URL` | Do not set this locally. Vercel sets it automatically in deployments, and it takes priority over `API_URL`. |

## Running

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server reloads automatically when you change code.

## Other commands

```bash
pnpm build   # production build
pnpm start   # serve the production build
pnpm lint    # run ESLint
```
