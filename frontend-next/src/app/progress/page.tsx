'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  CheckCircle2, BookOpen, Circle, Loader2, TrendingUp,
  Target, BarChart2, AlertCircle, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'text-[var(--color-muted)]', bg: 'bg-[var(--color-surface)]', border: 'border-[var(--color-border)]' },
  { value: 'learning',    label: 'Learning',    color: 'text-amber-600',  bg: 'bg-amber-50', border: 'border-amber-200' },
  { value: 'completed',  label: 'Completed',   color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
];

const StatusBadge = ({ status, skill, onChange }: { status: string, skill: string, onChange: (s: string, v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  const handleSelect = async (newStatus: string) => {
    if (newStatus === status) { setOpen(false); return; }
    setUpdating(true);
    setOpen(false);
    try {
      await api.patch(`/progress/skills/${encodeURIComponent(skill)}`, { status: newStatus });
      onChange(skill, newStatus);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={updating}
        className={`flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${cfg.bg} ${cfg.border} ${cfg.color} hover:opacity-80`}
      >
        {updating
          ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
          : status === 'completed'
          ? <CheckCircle2 className="w-3 h-3 mr-1.5" />
          : status === 'learning'
          ? <BookOpen className="w-3 h-3 mr-1.5" />
          : <Circle className="w-3 h-3 mr-1.5" />}
        {cfg.label}
        <ChevronDown className="ml-1.5 w-3 h-3 opacity-70" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-20 overflow-hidden">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full flex items-center px-4 py-2.5 text-xs font-medium transition-colors hover:bg-[var(--color-background)] ${opt.color}`}
            >
              {opt.value === 'completed' ? <CheckCircle2 className="w-3 h-3 mr-2" />
               : opt.value === 'learning' ? <BookOpen className="w-3 h-3 mr-2" />
               : <Circle className="w-3 h-3 mr-2" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 shadow-lg">
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
        <p className="text-sm font-bold text-[var(--color-accent)]">{payload[0].value}% Readiness</p>
      </div>
    );
  }
  return null;
};

export default function ProgressPage() {
  const [summary, setSummary] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, skillRes] = await Promise.all([
          api.get('/progress/summary'),
          api.get('/progress/skills'),
        ]);
        setSummary(sumRes.data);
        setSkills(skillRes.data);
      } catch (err) {
        console.error('Failed to load progress:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusChange = (skillName: string, newStatus: string) => {
    setSkills(prev =>
      prev.map(s => s.skill_name === skillName ? { ...s, status: newStatus } : s)
    );
    setSummary((prev: any) => {
      if (!prev) return prev;
      const old = skills.find(s => s.skill_name === skillName)?.status;
      const counts = { ...prev };
      if (old) counts[old] = Math.max(0, (counts[old] || 0) - 1);
      counts[newStatus] = (counts[newStatus] || 0) + 1;
      return counts;
    });
  };

  const filtered = filter === 'all' ? skills : skills.filter(s => s.status === filter);

  const chartData = summary?.readiness_trend?.map((p: any) => ({
    date: p.date,
    score: p.score,
  })) || [];

  const barData = [
    { name: 'Completed', value: summary?.completed || 0, color: '#22c55e' },
    { name: 'Learning',  value: summary?.learning  || 0, color: '#f59e0b' },
    { name: 'Not Started', value: summary?.not_started || 0, color: '#64748b' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[var(--color-accent)] animate-spin mb-4" />
        <h3 className="text-xl font-medium text-[var(--color-foreground)]">Loading your progress...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight">Your Progress</h2>
        <p className="text-[var(--color-muted)] mt-1">Track your skill development and readiness over time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Skills Tracked', value: summary?.total_skills ?? 0, icon: Target, bg: 'bg-blue-50 text-[var(--color-accent)] border-blue-100', text: 'text-[var(--color-accent)]' },
          { label: 'Learning In Progress', value: summary?.learning ?? 0, icon: BookOpen, bg: 'bg-amber-50 text-amber-600 border-amber-100', text: 'text-amber-600' },
          { label: 'Skills Completed', value: summary?.completed ?? 0, icon: CheckCircle2, bg: 'bg-green-50 text-green-600 border-green-100', text: 'text-green-600' },
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex items-center shadow-sm">
            <div className={`w-14 h-14 rounded-xl border flex items-center justify-center mr-5 ${card.bg}`}>
              <card.icon className="w-7 h-7" />
            </div>
            <div>
              <p className={`text-4xl font-black ${card.text}`}>{card.value}</p>
              <p className="text-sm font-medium text-[var(--color-muted)] mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness Trend */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] flex items-center mb-6 border-b border-[var(--color-border)] pb-4">
            <TrendingUp className="w-5 h-5 text-[var(--color-accent)] mr-2" />
            Readiness Trend
          </h3>
          <div className="flex-1 flex items-center justify-center">
            {chartData.length >= 2 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center p-8 bg-[var(--color-background)] rounded-lg border border-dashed border-[var(--color-border)] w-full">
                <AlertCircle className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2 opacity-50" />
                <p className="text-[var(--color-muted)] text-sm font-medium">Run at least 2 analyses to unlock your trend graph.</p>
              </div>
            )}
          </div>
        </div>

        {/* Skill Breakdown Bar */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] flex items-center mb-6 border-b border-[var(--color-border)] pb-4">
            <BarChart2 className="w-5 h-5 text-purple-500 mr-2" />
            Skill Status Breakdown
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={85} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skill List */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[var(--color-border)] pb-4">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] flex items-center">
            <Target className="w-5 h-5 text-[var(--color-accent)] mr-2" />
            Interactive Skill Tracker
          </h3>

          {/* Filter Tabs */}
          <div className="flex bg-[var(--color-background)] rounded-lg p-1 border border-[var(--color-border)] gap-1 shadow-inner">
            {['all', 'not_started', 'learning', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                  filter === f ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm border border-[var(--color-border)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] border border-transparent'
                }`}
              >
                {f === 'not_started' ? 'Not Started' : f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {skills.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-[var(--color-background)] rounded-xl border border-dashed border-[var(--color-border)]">
            <Target className="w-12 h-12 text-[var(--color-muted)] mb-4 opacity-50" />
            <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-1">No Skills Tracked Yet</h4>
            <p className="text-[var(--color-muted)] text-sm max-w-sm">Run an analysis on a job description to generate your personalized skill gap tracker.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-[var(--color-muted)] font-medium">No skills found in this category.</p>
        ) : (
          <div className="divide-y divide-[var(--color-border)] bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            {filtered.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-4 hover:bg-[var(--color-surface)] transition-colors group">
                <div className="flex items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mr-4 shadow-sm ${
                    skill.status === 'completed' ? 'bg-green-500' :
                    skill.status === 'learning' ? 'bg-amber-500' : 'bg-[var(--color-muted)] opacity-50'
                  }`} />
                  <span className={`font-semibold text-sm ${
                    skill.status === 'completed' ? 'text-[var(--color-muted)] line-through opacity-70' :
                    'text-[var(--color-foreground)]'
                  }`}>
                    {skill.skill_name}
                  </span>
                </div>

                <StatusBadge
                  status={skill.status}
                  skill={skill.skill_name}
                  onChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
