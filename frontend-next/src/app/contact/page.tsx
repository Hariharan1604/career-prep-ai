import { PublicNav } from '@/components/layout/PublicNav';
import { Briefcase } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans selection:bg-[var(--color-accent)] selection:text-white relative overflow-hidden flex flex-col">
      <PublicNav />
      
      <main className="flex-1 relative z-10 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-8 text-center bg-[var(--color-surface)]/80 p-12 rounded-3xl border border-[var(--color-border)] shadow-sm">
          <div className="w-16 h-16 bg-[var(--color-background)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--color-border)]">
            <Briefcase className="w-8 h-8 text-[var(--color-accent)]" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-foreground)] mb-4">Ready to accelerate your career?</h1>
          <p className="text-[var(--color-muted)] mb-10 text-lg">Have questions, feedback, or need support? We'd love to hear from you.</p>
          
          <form className="w-full flex flex-col gap-5 text-left">
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Email Address</label>
              <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Message</label>
              <textarea placeholder="How can we help?" rows={5} className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none transition-shadow"></textarea>
            </div>
            <button type="button" className="w-full py-3.5 mt-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Send Message
            </button>
          </form>
        </div>
      </main>

      <footer className="relative z-10 py-8 border-t border-[var(--color-border)] bg-[var(--color-background)] text-center mt-auto">
        <p className="text-[var(--color-muted)] text-sm">© {new Date().getFullYear()} Career Prep AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
