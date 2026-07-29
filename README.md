# 📒 Kirana Ledger — digital udhaar manager

Small kirana store owners across India still track customer credit (udhaar) in a paper notebook — easy to lose, easy to dispute, impossible to search. Kirana Ledger replaces that notebook with a simple digital ledger built for shopkeepers who aren't tech-savvy, so they can see exactly who owes what without flipping through pages.

🔗 **Live demo:** [kirana-ledger.netlify.app](https://kirana-ledger.netlify.app)
💻 **Source:** [github.com/tannukri01/kirana-ledger](https://github.com/tannukri01/kirana-ledger)

![demo](docs/demo.gif)
<!-- Screen recording of: add customer → record udhaar → mark payment → see updated dashboard -->

## Impact / numbers

- Tracks **unlimited customers** with a full transaction history per customer, not just a running total
- Dashboard surfaces **total outstanding credit** at a glance — the one number a shopkeeper actually needs each morning
- Auth-protected per-shop data via NextAuth.js — one store owner can't see another's ledger

## How it works

1. Shop owner signs in (NextAuth.js) — data is scoped to their account only
2. Add a customer once; record udhaar (credit given) or a payment against them any time after
3. Every transaction is timestamped and stored via Prisma, so "who paid when" is never in dispute
4. Dashboard aggregates all customers into total credit outstanding, total paid, and dues at a glance

```
Shop owner login → Customer record → Udhaar/payment entry → Prisma → Postgres → Dashboard aggregation
```

## A technical decision worth mentioning

Went with PostgreSQL + Prisma instead of a NoSQL store because this data is inherently relational — a customer has many transactions, and every transaction needs an accurate running balance. A schema with real foreign keys and types made "total dues per customer" a simple aggregate query instead of application-level bookkeeping, and Prisma's generated types kept API routes honest against the schema as it evolved.

## Tech stack

| Layer    | Technology                           |
| -------- | ------------------------------------ |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend  | Next.js API Routes, REST            |
| Database | PostgreSQL (Neon)                    |
| ORM      | Prisma                               |
| Auth     | NextAuth.js                          |
| Deploy   | Netlify                              |

## Running it locally

```bash
git clone https://github.com/tannukri01/kirana-ledger.git
cd kirana-ledger
npm install
```

Create a `.env.local` with:

```
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

```bash
npx prisma generate
npm run dev
```

## What I'd build next

- WhatsApp payment reminders sent directly to customers with outstanding udhaar
- Offline-first support (PWA) since many kirana stores have unreliable internet
- Bulk import of existing paper-ledger customers via CSV

---

Built by **Tannu Kumari** — [LinkedIn](https://www.linkedin.com/in/tannu-kumariofficial) · [GitHub](https://github.com/tannukri01)
