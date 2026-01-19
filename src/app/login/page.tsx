'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/auth';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const _router = useRouter(); // Keep for potential future use
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check for error from callback
  const error = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    if (mode === 'signup') {
      // Sign up with email/password
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: 'Konto erstellt! Sie können sich jetzt anmelden.',
        });
      }
    } else {
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login result:', { data, error });
      console.log('Running in iframe:', window.self !== window.top);
      console.log('Current location:', window.location.href);

      if (error) {
        console.error('Login error:', error);
        setMessage({ type: 'error', text: error.message });
      } else {
        console.log('Login successful, redirecting...');

        // Check if session was actually stored
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Session after login:', sessionData);

        // Use window.location for full page reload (works in iframe context)
        window.location.href = '/';
        return;
      }
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
          <p className="mt-2 text-gray-600">
            {mode === 'login' ? 'Melden Sie sich an' : 'Konto erstellen'}
          </p>
        </div>

        {/* Error from callback */}
        {error && (
          <div className="p-4 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
            Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Max Mustermann"
                required
                disabled={loading}
                className="w-full"
              />
            </div>
          )}

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !email || !password || (mode === 'signup' && !name)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Bitte warten...' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
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

        {/* Toggle Mode */}
        <div className="text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Noch kein Konto?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-blue-600 hover:underline font-medium"
              >
                Registrieren
              </button>
            </>
          ) : (
            <>
              Bereits ein Konto?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 hover:underline font-medium"
              >
                Anmelden
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
