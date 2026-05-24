'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', shopName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        if (res?.error) setError('Invalid email or password');
        else router.push('/dashboard');
      } else {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) setError(data.error || 'Registration failed');
        else {
          await signIn('credentials', { email: form.email, password: form.password, redirect: false });
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Kirana Ledger</h1>
        <p className="text-center text-gray-500 mb-6">{isLogin ? 'Sign in to your shop' : 'Create your shop account'}</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Shop Name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-medium hover:underline">
            {isLogin ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
