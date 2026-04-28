# Oaks & Bims Nigeria Limited — Real Estate Website

A production-ready Next.js 14 site for **Oaks & Bims Nigeria Limited**, with:

- Public property browsing with filters (state, type, beds, purpose, full-text search)
- Property detail pages with image galleries, features, amenities, and inquiry form
- **Customer accounts** (sign up, log in, save favorites, view inquiries)
- **Admin panel** for full CRUD on properties, image uploads, inquiry inbox, subscriber list, and newsletter sender
- **Currency toggle** (₦ NGN / $ USD / £ GBP) with live FX rates — auto-detects the visitor's preferred currency
- **Newsletter** subscription via Resend (double opt-in, unsubscribe, batch send to confirmed subscribers)
- All 36 Nigerian states + FCT supported
- Tailwind + shadcn-style UI primitives, mobile-first, accessible

Built on **Next.js · Supabase · Resend · Tailwind**.

---

## 1 · One-time setup

You'll need accounts on three free services. Each takes 2 minutes.

### a) Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Name it `oaks-and-bims`. Save the database password somewhere safe.
3. Once it finishes provisioning, go to **SQL Editor → New query** and paste the entire contents of `supabase/schema.sql`. Click **Run**.
4. (Optional) Run `supabase/seed.sql` next to add 6 sample listings. Skip if you'd rather start empty.
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (keep secret!) → `SUPABASE_SERVICE_ROLE_KEY`

### b) Create the Resend account

1. Go to [resend.com](https://resend.com) → sign up.
2. Add your domain (e.g. `oaksandbims.com`) under **Domains** and follow the DNS setup. Until that's verified you can use the sandbox `onboarding@resend.dev` from address.
3. Go to **API Keys** → create one → copy it as `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL="Oaks & Bims <hello@yourdomain.com>"` once your domain is verified.

### c) Wire Supabase Auth to use Resend (so customer signup/reset emails go out)

Supabase ships with its own free email sender that's heavily rate-limited. To use Resend:

1. In Supabase, go to **Project Settings → Auth → SMTP Settings**.
2. Toggle **Enable Custom SMTP**, then enter:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: your Resend API key
   - Sender email: e.g. `hello@oaksandbims.com`
   - Sender name: `Oaks & Bims Nigeria`
3. Save.
4. Still in Auth → **URL Configuration**, set **Site URL** to your real site (use `http://localhost:3000` while developing).
5. In **Email Templates**, customize the confirmation, password-reset, and magic-link templates to match the brand. (Optional but recommended.)

---

## 2 · Run it locally

```bash
# 1) install
npm install

# 2) configure
cp .env.local.example .env.local
# fill in the values from step 1

# 3) start
npm run dev
```

Open http://localhost:3000.

---

## 3 · Make yourself an admin

The first user you sign up is just a regular customer. To grant yourself admin access:

1. Sign up through the website (`/signup`) — you'll get a confirmation email; click the link.
2. In Supabase **SQL Editor**, run:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

3. Refresh the site. You'll now see an **Admin** button in the header. The admin panel lives at `/admin`.

---

## 4 · How the pieces fit together

```
app/
├── page.tsx                    Home (hero, featured, services, by-state, diaspora CTA)
├── properties/page.tsx         Search & filter (state / purpose / type / beds / keyword)
├── properties/[slug]/page.tsx  Detail page with gallery, inquiry form, save-to-favorites
├── about, contact              Static marketing pages
├── login, signup, forgot/reset Customer auth (Supabase Auth + custom SMTP)
├── account/page.tsx            Customer dashboard: saved properties, inquiries, profile
├── admin/                      Admin-only panel (RLS + middleware-enforced)
│   ├── page.tsx                Dashboard with counters
│   ├── properties/             List, create, edit, delete
│   ├── inquiries/              Inbox with mark-as-handled
│   ├── subscribers/            Newsletter subscribers list
│   └── newsletter/             Pick listings + send via Resend
├── api/
│   ├── inquiries/              POST a new inquiry
│   ├── newsletter/subscribe    Email confirmation flow
│   ├── newsletter/confirm      Double opt-in
│   ├── newsletter/unsubscribe  One-click unsubscribe via signed URL
│   ├── newsletter/send         Admin-only batch send (10 listings max)
│   └── fx-rates                Cached FX feed (12h) for the currency toggle
└── auth/callback               Supabase email-link redirect handler

lib/
├── supabase/{client,server,middleware}.ts   3 flavors: browser, RSC, edge
├── resend.ts                                Resend client + email templates
├── currency.ts                              NGN/USD/GBP conversion + formatters
├── nigeria-states.ts                        36 states + FCT
└── types.ts                                 Hand-maintained DB row types

components/
├── ui/                          shadcn-style primitives (Button, Input, Card, etc.)
├── admin/                       Admin-only widgets
└── *                            Site header/footer, currency toggle, property card, etc.

supabase/
├── schema.sql                   Tables, RLS, storage bucket, triggers
└── seed.sql                     Sample data
```

### Database tables

- `profiles` — one row per Supabase auth user; `role` is `customer` or `admin`. Auto-created on signup via trigger.
- `properties` — the listings. `slug` is the URL key. RLS hides `draft` from the public.
- `favorites` — many-to-many of users ↔ properties.
- `inquiries` — contact-form / property-page submissions. Anyone can insert; only the submitter and admins can read.
- `newsletter_subscribers` — email + double opt-in token + unsubscribe token.

### Row-Level Security

All policies are defined in `supabase/schema.sql`. Highlights:

- Public can `select` properties where `status <> 'draft'`.
- Anyone can `insert` an inquiry or newsletter subscription.
- Customers can `select`/`update` their own profile and favorites.
- Admins can do everything (gated by the `is_admin()` SQL function).
- The Storage bucket `property-images` is public for read but admin-only for write.

### Currency

`/api/fx-rates` proxies a free public FX feed (default: `open.er-api.com`, override with `FX_RATES_API_URL`) and caches it server-side for 12 hours. The browser-side `CurrencyProvider` fetches once per session and stores the user's choice in `localStorage`. Drop `<PriceDisplay ngn={n}/>` anywhere to render in the active currency.

---

## 5 · Deploy to Vercel

1. Push this directory to a GitHub repo.
2. In Vercel → **New Project** → import the repo.
3. Under **Environment Variables**, paste every value from your `.env.local`.
4. Set **Build Command** to `next build` (default) and click Deploy.
5. Once it's live, go back to **Supabase → Auth → URL Configuration** and update:
   - `Site URL` → `https://your-vercel-domain.com`
   - Add `https://your-vercel-domain.com/auth/callback` to **Redirect URLs**

That's it.

---

## 6 · Common next steps

Things you might want to add as the business grows:

- **Inquiry email alerts to admin** — extend `/api/inquiries` to also send a notification to your team via Resend (the email template helper in `lib/resend.ts` is the place to add it).
- **Map view** — drop a Mapbox/Leaflet map onto `/properties` and pin each listing. Lat/lng columns can be added to the `properties` table.
- **Mortgage / payment-plan calculator** — Nigerian buyers love these; build a small client component on the detail page.
- **Multi-agent support** — extend `user_role` enum with `agent` and add an `owner_id` to properties. Most of the RLS plumbing is already in place.
- **WhatsApp integration** — a floating "Chat on WhatsApp" button using `wa.me` deep links. Useful for both local and diaspora buyers.
- **Analytics** — drop in PostHog or Plausible to see which states / property types drive the most inquiries.

---

## 7 · Troubleshooting

**"Email rate limit exceeded" when signing up**
You're using Supabase's default SMTP (3 emails/hour). Configure custom SMTP via Resend (see step 1c).

**Admin panel says "redirected to home"**
Your profile's `role` is still `customer`. Run the `update public.profiles set role = 'admin'…` SQL above.

**Image uploads fail**
Storage policies live in `supabase/schema.sql`. Make sure you ran the *entire* file, including the bottom block that creates the `property-images` bucket.

**"Invalid token" on newsletter confirmation**
The link was already used or the row was deleted. Subscribe again to get a fresh token.

**Currency toggle stuck on NGN**
Open `/api/fx-rates` directly — if it returns `"source": "fallback"`, your `FX_RATES_API_URL` is unreachable. The fallback rates in `lib/currency.ts` are intentionally rough; update them or set the env var.

---

© Oaks & Bims Nigeria Limited
# Oaks-Bims
