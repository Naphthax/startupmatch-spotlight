import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Ein Platzhalter-Icon für Ihr Logo. Sie können dies durch Ihr eigenes SVG oder <Image>-Tag ersetzen.
const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
  </svg>
);

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#000000]">
      {/* HEADER */}
      <header className="absolute top-0 left-0 w-full p-4 sm:p-6">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 text-[#00ff88]">
            <LogoIcon className="h-8 w-8" />
            <span className="text-xl font-bold">StartupMatch</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
            Die direkte Verbindung zwischen Vision und Kapital
          </h1>
          <p className="mx-auto mt-4 text-gray-400 md:text-xl">
            Präsentieren Sie Ihren Pitch. Geben Sie Feedback. Investieren Sie in
            die Zukunft. Alles auf einer Plattform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" passHref className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto text-lg"
                size="lg"
              >
                Jetzt Registrieren
              </Button>
            </Link>
            <Link href="/login" passHref className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-lg border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black"
                size="lg"
              >
                Einloggen
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} StartupMatch Inc. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/terms" className="hover:text-[#00ff88]">
              Nutzungsbedingungen
            </Link>
            <Link href="/privacy" className="hover:text-[#00ff88]">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}