// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Ein einfaches Lade-Spinner-Icon
const Loader2 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Benutzer bei Supabase anmelden
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error("E-Mail oder Passwort ist ungültig.");
      }

      if (!data.user) {
        throw new Error("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
      }
      
      // 2. Die Rolle des Benutzers aus der 'profiles'-Tabelle abrufen
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error("Benutzerprofil konnte nicht geladen werden.");
      }
      
      // 3. Basierend auf der Rolle weiterleiten
      if (profileData.role === 'startup') {
        router.push('/dashboard');
      } else {
        router.push('/feed');
      }
      // Wichtig: router.refresh() sorgt dafür, dass Server-Komponenten den neuen Login-Status erkennen.
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#000000] p-4">
      <Card className="w-full max-w-md border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">
            Willkommen zurück!
          </CardTitle>
          <CardDescription className="text-gray-400 pt-2">
            Melde dich an, um fortzufahren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-center text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full text-lg" disabled={isLoading}>
              {isLoading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                'Anmelden'
              )}
            </Button>
            <div className="text-center text-sm text-gray-400">
              Noch kein Konto?{' '}
              <Link href="/signup" className="font-semibold text-[#00ff88] hover:underline">
                Registrieren
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}