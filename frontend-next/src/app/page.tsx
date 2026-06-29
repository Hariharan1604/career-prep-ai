import Link from 'next/link';
import { PublicNav } from '@/components/layout/PublicNav';
import { ArrowRight, CheckCircle2, ShieldAlert, Server, PlayCircle, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans selection:bg-[var(--color-accent)] selection:text-white relative overflow-hidden">
      
      {/* Background decorations to match the glassmorphic feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-accent)]/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Concentric circles background mimicking the image */}
      <div className="absolute top-1/2 right-[10%] transform -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[var(--color-border)]/30 pointer-events-none" />
      <div className="absolute top-1/2 right-[15%] transform -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[var(--color-border)]/30 pointer-events-none" />
      <div className="absolute top-1/2 right-[20%] transform -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[var(--color-border)]/30 pointer-events-none" />

      {/* Navbar */}
      <PublicNav />

      {/* Hero Section */}
      <main id="home" className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-24 lg:pt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Text & CTA */}
        <div className="flex flex-col items-start max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-muted)] mb-6 shadow-sm">
            <span className="text-[var(--color-accent)]">✨</span> Next-Gen AI Interview Prep
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold text-[var(--color-foreground)] tracking-tight leading-[1.1] mb-6">
            Smart, Personalized, and <span className="text-[var(--color-accent)] opacity-90">Intelligent Career Prep</span>
          </h1>
          
          <p className="text-lg text-[var(--color-muted)] mb-10 leading-relaxed">
            Experience lightning-fast interview preparation. Upload your resume, discover your skill gaps in real time, and track your personalized learning roadmap inside a beautifully calm, glassmorphic workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
            <Link 
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Access Career Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="#"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] font-semibold flex items-center justify-center gap-2 hover:bg-[var(--color-background)] transition-colors shadow-sm"
            >
              Explore Features
            </Link>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-[var(--color-muted)] font-medium">
            <Link href="#" className="flex items-center gap-1.5 hover:text-[var(--color-foreground)] transition-colors">
              <PlayCircle className="w-4 h-4" /> What is Career Prep AI?
            </Link>
            <Link href="#" className="flex items-center gap-1.5 hover:text-[var(--color-foreground)] transition-colors">
              <Activity className="w-4 h-4" /> View Success Rates
            </Link>
          </div>
        </div>

        {/* Right Column: Glassmorphic UI Illustration */}
        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[600px] flex items-center justify-center perspective-1000">
          
          {/* Mock Browser/Dashboard Window */}
          <div className="relative w-full max-w-lg bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
            
            {/* Window Controls */}
            <div className="flex items-center gap-2 mb-6 border-b border-[var(--color-border)]/50 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>

            {/* Dashboard Mock Content */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border)] shadow-inner flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Readiness Score</span>
                <span className="text-3xl font-black text-[var(--color-foreground)]">84<span className="text-sm text-[var(--color-muted)] font-normal">%</span></span>
              </div>
              <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border)] shadow-inner flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Skills Matched</span>
                <span className="text-3xl font-black text-green-500">12<span className="text-sm text-[var(--color-muted)] font-normal">/15</span></span>
              </div>
            </div>

            {/* Mock Items list */}
            <div className="space-y-3">
              <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Server className="w-4 h-4 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">Technical Interview Prep</p>
                    <p className="text-[10px] text-[var(--color-muted)]">5 questions generated based on React & Node.js</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-50 text-green-600 text-[9px] font-bold uppercase rounded-md border border-green-200">Ready</span>
              </div>
              
              <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-50 border border-yellow-100 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">Missing Skill: Docker</p>
                    <p className="text-[10px] text-[var(--color-muted)]">Critical requirement for target role</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-[9px] font-bold uppercase rounded-md border border-yellow-200">Action Needed</span>
              </div>

              <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">Roadmap Milestone 1</p>
                    <p className="text-[10px] text-[var(--color-muted)]">Complete Advanced System Design</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[9px] font-bold uppercase rounded-md border border-gray-200">In Progress</span>
              </div>
            </div>

            {/* Decorative Side Navigation indicators */}
            <div className="absolute top-16 -left-4 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[var(--color-muted)]/30"></div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[var(--color-background)] border border-[var(--color-accent)] flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[var(--color-accent)]"></div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[var(--color-muted)]/30"></div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
