import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <p className="text-sm font-medium text-brand mb-4">Nandi</p>
        <h1 className="text-4xl md:text-6xl font-bold mb-5 tracking-tight text-textMain">
          Customer conversations, in one workspace
        </h1>
        <p className="text-lg text-textMuted mb-10 max-w-xl leading-relaxed">
          An Africa-first engagement platform for SMS and WhatsApp. Built for agents who need a fast, reliable inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white rounded-full hover:bg-brandDark font-semibold"
          >
            Create workspace
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center px-6 py-3 bg-surface border border-border rounded-full hover:bg-soft font-semibold text-textMain"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
