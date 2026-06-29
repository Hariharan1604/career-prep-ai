import { PublicNav } from '@/components/layout/PublicNav';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans selection:bg-[var(--color-accent)] selection:text-white relative overflow-hidden flex flex-col">
      <PublicNav />
      
      <main className="flex-1 relative z-10 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-8">About Career Prep AI</h1>
          <p className="text-xl text-[var(--color-muted)] leading-relaxed mb-12">
            Job hunting is hard enough without having to guess what interviewers will ask or what skills you're missing. 
            We built Career Prep AI to level the playing field. By leveraging state-of-the-art machine learning, we provide 
            candidates with the insights they need to walk into any interview with confidence.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[var(--color-border)] pt-12 mt-4">
            <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col items-center justify-center">
              <p className="text-5xl font-black text-[var(--color-accent)] mb-2">10x</p>
              <p className="text-[var(--color-foreground)] font-medium">Faster Prep Time</p>
              <p className="text-sm text-[var(--color-muted)] mt-2">Skip the manual searching and guessing.</p>
            </div>
            <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col items-center justify-center">
              <p className="text-5xl font-black text-[var(--color-accent)] mb-2">100%</p>
              <p className="text-[var(--color-foreground)] font-medium">Personalized</p>
              <p className="text-sm text-[var(--color-muted)] mt-2">Based entirely on your resume and target role.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-8 border-t border-[var(--color-border)] bg-[var(--color-background)] text-center mt-auto">
        <p className="text-[var(--color-muted)] text-sm">© {new Date().getFullYear()} Career Prep AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
