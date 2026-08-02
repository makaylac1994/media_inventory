# House Inventory

A personal home-inventory app with tabs for Media, Games, and Books — each a sortable list you can add to and edit. Built with Next.js (App Router) + Supabase (Postgres + Auth), deployable to Vercel and synced across devices.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account/project (you'll need to do this yourself — it's your account).
2. In the Supabase dashboard, open **SQL Editor**, paste the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it. This creates the `media_items`, `game_items`, and `book_items` tables with row-level security so only a logged-in user can read/write.
3. Go to **Authentication → Users** and manually add one user (your email + a password). This app has no public sign-up screen — it's single-user by design.
4. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**.

## 2. Configure local environment

Copy the example env file and fill in the values from step 1:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`. Sign in with the user you created in Supabase.

## 4. Push to GitHub

```bash
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

(Create the empty repo on [github.com](https://github.com/new) first — this is your account, so you'll need to do that step yourself.)

## 5. Deploy to Vercel (for cross-device sync)

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. Add the same two environment variables from step 2 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
3. Deploy. Every `git push` to `main` after this auto-deploys.

Once deployed, any device can open the Vercel URL, log in, and see the same live data — Supabase is the shared source of truth, not the git repo.

## Project structure

- `app/media`, `app/games`, `app/books` — the three tabs, each a thin page rendering `<InventoryTab schema={...} />`.
- `components/InventoryTab.tsx` — shared list/sort/add/edit/delete logic, driven by a schema config.
- `components/InventoryTable.tsx`, `components/ItemFormModal.tsx` — generic sortable table and add/edit form, config-driven so the three tabs don't duplicate UI code.
- `lib/schemas/{media,games,books}.ts` — per-tab field and column definitions (this is what to edit to add/change fields for a tab).
- `supabase/migrations/0001_init.sql` — the database schema.
- `components/AuthGate.tsx`, `app/login/page.tsx` — login gate wrapping the whole app.

## Adding a new field to a tab

Edit the relevant file in `lib/schemas/` (e.g. `lib/schemas/media.ts`) to add a column + field entry, then add the matching column to the Supabase table via a new migration file or the Supabase dashboard's table editor.
