'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { BookOpen, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="w-6 h-6" />
            <span>Kirana Ledger</span>
          </Link>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>{session.user.name || session.user.email}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-1 bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-md text-sm transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <span className="text-sm opacity-90">Digital Udhaar Manager</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
