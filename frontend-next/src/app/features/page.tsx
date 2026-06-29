import { PublicNav } from '@/components/layout/PublicNav';
import { Activity, Server, CheckCircle2 } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans selection:bg-[var(--color-accent)] selection:text-white relative overflow-hidden flex flex-col">
      <PublicNav />
      
      <main className="flex-1 relative z-10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-6">Everything You Need to Succeed</h1>
            <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed">
              Our AI-powered platform analyzes your profile from every angle to ensure you're fully prepared for your next big interview.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100">
                <Activity className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-3">Skill Gap Analysis</h3>
              <p className="text-[var(--color-muted)] leading-relaxed text-sm">We compare your resume against real job descriptions to pinpoint exactly which skills you're missing and what you need to learn.</p>
            </div>
            
            <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-6 border border-green-100">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-3">AI Interview Questions</h3>
              <p className="text-[var(--color-muted)] leading-relaxed text-sm">Get personalized technical, behavioral, and project-based questions generated dynamically based on your unique experience.</p>
            </div>
            
            <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-6 border border-purple-100">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-3">Custom Learning Roadmap</h3>
              <p className="text-[var(--color-muted)] leading-relaxed text-sm">Turn your weaknesses into strengths with a curated roadmap of courses and milestones tailored to close your specific skill gaps.</p>
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
