'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CheckCircle2, Clock, Loader2, PlayCircle, RefreshCw, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Milestone {
  id: string;
  milestone_title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  target_date: string;
  course_url?: string;
}

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'text-[var(--color-muted)]',  bg: 'bg-[var(--color-background)]',     border: 'border-[var(--color-border)]', dot: 'bg-gray-400' },
  in_progress: { label: 'In Progress', color: 'text-[var(--color-accent)]',    bg: 'bg-blue-50',    border: 'border-blue-200', dot: 'bg-[var(--color-accent)] animate-pulse' },
  completed:   { label: 'Completed',   color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
};

const MilestoneCard = ({ milestone, onUpdate }: { milestone: Milestone, onUpdate: (id: string, status: string) => void }) => {
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.pending;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === milestone.status) return;
    setUpdating(true);
    try {
      await api.patch(`/roadmap/${milestone.id}`, { status: newStatus });
      onUpdate(milestone.id, newStatus);
    } catch (err) {
      console.error('Failed to update milestone:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={`relative flex items-start p-5 rounded-xl border transition-all duration-300 ${cfg.bg} ${cfg.border} shadow-sm z-10`}>
      {/* Milestone status icon */}
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 mr-4 bg-[var(--color-surface)] ${
        milestone.status === 'completed' ? 'border-green-500 text-green-500' :
        milestone.status === 'in_progress' ? 'border-[var(--color-accent)] text-[var(--color-accent)]' :
        'border-[var(--color-border)] text-[var(--color-muted)]'
      }`}>
        {milestone.status === 'completed'
          ? <CheckCircle2 className="w-5 h-5" />
          : milestone.status === 'in_progress'
          ? <PlayCircle className="w-5 h-5" />
          : <Clock className="w-5 h-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className={`font-semibold text-base ${cfg.color}`}>{milestone.milestone_title}</h4>
            <p className="text-[var(--color-muted)] text-sm mt-1 leading-relaxed">{milestone.description}</p>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="flex items-center text-xs text-[var(--color-muted)] bg-[var(--color-background)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border)]">
              <Calendar className="w-3 h-3 mr-1.5" />
              {new Date(milestone.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Status actions */}
        <div className="flex items-center space-x-2 mt-4">
          {updating ? (
            <Loader2 className="w-4 h-4 text-[var(--color-accent)] animate-spin" />
          ) : (
            <>
              {milestone.status !== 'in_progress' && milestone.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-[var(--color-accent)] border border-blue-200 rounded-lg hover:bg-[var(--color-accent)] hover:text-white transition-colors font-medium"
                >
                  Start
                </button>
              )}
              {milestone.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-600 hover:text-white transition-colors font-medium"
                >
                  Mark Complete
                </button>
              )}
              {milestone.status === 'completed' && (
                <button
                  onClick={() => handleStatusChange('pending')}
                  className="text-xs px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)] transition-colors font-medium"
                >
                  Undo
                </button>
              )}
              {milestone.course_url && (
                <a
                  href={milestone.course_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-background)] transition-colors font-medium flex items-center"
                >
                  <PlayCircle className="w-3.5 h-3.5 mr-1 text-[var(--color-accent)]" />
                  View Course
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function RoadmapPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/roadmap')
      .then(res => setMilestones(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (id: string, newStatus: string) => {
    setMilestones(prev =>
      prev.map(m => m.id === id ? { ...m, status: newStatus as any } : m)
    );
  };

  const completed = milestones.filter(m => m.status === 'completed').length;
  const total = milestones.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      {/* Progress Header */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Your Learning Roadmap</h2>
            <p className="text-[var(--color-muted)] mt-1">{completed} of {total} milestones completed</p>
          </div>
          <div className="text-5xl font-black text-[var(--color-accent)]">{progressPct}%</div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-[var(--color-background)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div
            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
          <span>Start</span>
          <span>Job Ready</span>
        </div>
      </div>

      {/* Milestones */}
      {milestones.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <RefreshCw className="w-12 h-12 text-[var(--color-muted)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">No roadmap generated yet</h3>
          <p className="text-[var(--color-muted)] max-w-sm mb-6 text-sm">
            Run a career analysis first. Your personalized roadmap will be auto-generated from your skill gaps.
          </p>
          <Link
            href="/analysis"
            className="px-6 py-2.5 bg-[var(--color-accent)] text-white font-medium rounded-xl hover:bg-[var(--color-accent-hover)] transition-all shadow-sm"
          >
            Run Analysis
          </Link>
        </div>
      ) : (
        <div className="relative space-y-6">
          {/* Vertical timeline line */}
          <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-[var(--color-border)] z-0" style={{marginLeft: '-1px'}}></div>

          {milestones.map((m) => (
            <MilestoneCard key={m.id} milestone={m} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
