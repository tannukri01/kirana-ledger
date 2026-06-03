📒 Kirana Ledger — Digital Udhar Manager

A modern web application for small shopkeepers (kirana stores) to manage customer credit (udhaar), track payments, and maintain digital records.

🔗 **Live Demo:** [kirana-ledger.netlify.app]
(https://kirana-ledger.netlify.app)  
💻 **GitHub:** [github.com/tannukri01/kirana-ledger](https://github.com/tannukri01/kirana-ledger)

---

## ✨ Features

- **Customer Management** — Add, edit, and manage customer profiles
- **Credit Tracking** — Record udhaar (credit) transactions per customer
- **Payment History** — Track who paid what and when
- **Dashboard Analytics** — Visual overview of total credit, payments, and dues
- **Authentication** — Secure login with NextAuth.js
- **Responsive Design** — Works on mobile and desktop

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, REST API |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js |
| Deploy | Netlify |

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/tannukri01/kirana-ledger.git
cd kirana-ledger

# Install
npm install

# Setup env
cp .env.example .env.local
# Add your DATABASE_URL and NEXTAUTH_SECRET

# Generate Prisma client
npx prisma generate

# Run dev server
npm run dev
Open http://localhost:3000

🔧 Environment Variables
env


DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
📁 Project Structure


src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes (auth, customers, transactions)
│   ├── dashboard/      # Main dashboard UI
│   └── page.tsx        # Landing page
├── components/         # Reusable UI components
├── lib/               # Utilities, Prisma client
└── prisma/            # Database schema
🏗️ Built By
Tannu Singh — Full Stack Developer



