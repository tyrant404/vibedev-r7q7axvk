# Snack Shelf Life Tracker

A pantry list for the stash of chips, cookies, granola bars and dried fruit. Log
what you bought, when you bought it, and how long it keeps. The app works out
what is still good and what needs tossing.

## How the freshness read works

Each snack expires on `bought on + keeps for` days. From that the app derives:

| Status      | Colour | Condition                                |
| ----------- | ------ | ---------------------------------------- |
| Fresh       | green  | more than 30% of the shelf life is left  |
| Getting old | yellow | 30% or less is left, but not past expiry |
| Toss it     | red    | past the expiry date                     |

The 30% window is never shorter than one day, so short-lived snacks still get a
warning before they turn. The list re-sorts so the most urgent row is on top,
and it re-checks the date every 30 seconds, so a tab left open overnight rolls
its statuses over without a refresh.

## Storage

Everything lives in the browser's `localStorage` under `snack-shelf-life:v1`.
No account, no server, no data leaving the device. If the browser blocks local
storage the app says so and keeps working for the session.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4, light and dark via `prefers-color-scheme`
- Motion for add and delete feedback, disabled under `prefers-reduced-motion`
- Phosphor Icons, Geist and Geist Mono

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build   # production build
npm run lint    # eslint
```

---

give me high score pls
