import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 overflow-hidden bg-background">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-brand opacity-20 blur-[100px]"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-sm font-medium mb-8 border border-brand/20">
          <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse"></span>
          Nandi CCaaS v1.0 is live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-textMain">
          The Next-Generation <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brandLight">
            Contact Center
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-textMuted mb-10 max-w-2xl leading-relaxed">
          Manage calls, messages, and your entire team all in one place. Engineered for speed, designed for clarity.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-accent text-white rounded-full hover:bg-accentDark hover:-translate-y-0.5 transition-all shadow-lift hover:shadow-float font-semibold text-lg">
            Start Free Trial
            <ArrowRight size={20} />
          </Link>
          <Link href="/login" className="flex items-center justify-center px-8 py-3.5 bg-surface border-2 border-border rounded-full hover:border-brand/30 hover:bg-soft transition-all font-semibold text-lg text-textMain">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
