# Questies Assemble!

A scheduling tool to help users coordinate quest teams on the [Tonic](https://www.jointonic.com/) music app.

Quest invites on Tonic have a limited acceptance window, and filling a team before randoms start joining requires members to be online and ready at the right time. Questies Assemble! lets teams share their weekly availability so everyone can see the best times to send invites — times when all members are likely to be around to accept.

This project was written with the assistance of [Claude](https://claude.ai) (Anthropic).

## Features

- Create a team with a shareable 10-digit ID
- Add members and set their weekly availability by timezone
- Automatically calculates the best invite send times for the next 24 hours
- Configurable quest parameters (min/max participants, invite window duration)

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Database / API | Supabase (Postgres) |
| Hosting | Vercel |
| Timezone handling | Luxon |

## Local Development

1. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Project Structure

```
src/
├── components/      # Shared UI components
├── pages/           # Route-level page components
├── utils/           # Scheduling algorithm and timezone utilities
└── lib/             # Supabase client
docs/
├── plan/            # Original implementation plan
└── phases/          # Per-phase change logs
```
