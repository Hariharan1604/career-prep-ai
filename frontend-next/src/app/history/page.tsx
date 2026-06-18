'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Target, ChevronRight, Loader2, FileSearch } from 'lucide-react';

interface HistoryItem {
  id: string;
  target_role: string;
  created_at: string;
  skills_matched: number;
  skills_missing: number;
  readiness_score: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analysis/history')
      .then(res => setHistory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Assessment History</h2>
          <p className="text-[var(--color-muted)] mt-1 text-sm">
            {history.length > 0
              ? `You have ${history.length} analysis session${history.length !== 1 ? 's' : ''}`
              : 'No analyses yet'}
          </p>
        </div>
        <Link
          href="/analysis"
          className="px-4 py-2 bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:bg-[var(--color-background)] text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          + New Analysis
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center mb-4">
            <FileSearch className="w-8 h-8 text-[var(--color-muted)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">No analyses yet</h3>
          <p className="text-[var(--color-muted)] max-w-sm mb-6 text-sm">
            Upload your resume and pick a target role to run your first career analysis.
          </p>
          <Link
            href="/analysis"
            className="px-6 py-2.5 bg-[var(--color-accent)] text-white font-medium rounded-xl hover:bg-[var(--color-accent-hover)] transition-all shadow-sm"
          >
            Start First Analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((a, index) => (
            <Link
              key={a.id}
              href={`/analysis/${a.id}`}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex items-center hover:border-[var(--color-accent)] hover:shadow-md transition-all group"
            >
              {/* Index Badge */}
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mr-5 flex-shrink-0">
                <span className="text-[var(--color-accent)] font-bold text-sm">#{history.length - index}</span>
              </div>

              {/* Role Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <Target className="w-4 h-4 text-[var(--color-muted)] mr-2 flex-shrink-0" />
                  <h3 className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                    {a.target_role}
                  </h3>
                </div>
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  {new Date(a.created_at).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>

              {/* Skill Stats */}
              <div className="hidden md:flex items-center space-x-8 mr-8">
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{a.skills_matched}</p>
                  <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">Matched</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-500">{a.skills_missing}</p>
                  <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">Missing</p>
                </div>
              </div>

              {/* Readiness Score */}
              <div className="flex items-center mr-6">
                <div className={`text-2xl font-black ${
                  a.readiness_score >= 70 ? 'text-green-600' :
                  a.readiness_score >= 40 ? 'text-yellow-600' : 'text-red-500'
                }`}>
                  {a.readiness_score}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-32 mr-6 hidden lg:block">
                <div className="h-2 bg-[var(--color-background)] rounded-full overflow-hidden border border-[var(--color-border)]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      a.readiness_score >= 70 ? 'bg-green-500' :
                      a.readiness_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${a.readiness_score}%` }}
                  />
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
