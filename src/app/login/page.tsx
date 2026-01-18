'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({
        type: 'success',
        text: 'Login-Link wurde an Ihre Email gesendet. Bitte prüfen Sie Ihren Posteingang.',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            X-Press <span className="text-blue-600">XOS</span>
          </h1>
          <p className="mt-2 text-gray-600">Melden Sie sich mit Ihrer Email an</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email-Adresse
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@x-press.de"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Wird gesendet...' : 'Magic Link senden'}
          </Button>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Info */}
        <p className="text-center text-xs text-gray-500">
          Sie erhalten einen sicheren Login-Link per Email.
          <br />
          Kein Passwort erforderlich.
        </p>
      </div>
    </div>
  );
}
