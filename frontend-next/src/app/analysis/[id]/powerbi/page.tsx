'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, ArrowLeft, Download, Database, BarChart3, PieChart as PieIcon,
  Activity, BookOpen, Target, CheckCircle2, XCircle, TrendingUp, Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, AreaChart, Area
} from 'recharts';

// Power BI brand colors
const PBI_YELLOW = '#f2c811';
const PBI_DARK = '#1b1b2f';
const PBI_CARD = '#252540';
const PBI_BORDER = '#33334d';
const PBI_TEXT = '#e0e0e0';
const PBI_MUTED = '#8888a0';
const CHART_COLORS = ['#f2c811', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

export default function PowerBIDashboard() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/analysis/${id}`),
      api.get('/roadmap').catch(() => ({ data: [] })),
    ]).then(([analysisRes, roadmapRes]) => {
      setData(analysisRes.data);
      setRoadmap(roadmapRes.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadDataset = useCallback(() => {
    if (!data) return;
    const dataset: any = {
      assessment_summary: {
        id: data.id,
        target_role: data.target_role,
        readiness_score: data.readiness_score,
        date: data.created_at,
        candidate: data.profile?.name || '',
        email: data.profile?.email || '',
      },
      skills: data.skills?.map((s: any) => ({
        name: s.name,
        status: s.status,
        is_required: s.is_required,
      })) || [],
      questions: data.questions?.map((q: any) => ({
        question: q.question,
        category: q.category,
        skill: q.skill || '',
        answer: q.answer || '',
      })) || [],
      courses: data.courses || {},
      roadmap: roadmap.map((m: any) => ({
        title: m.milestone_title,
        status: m.status,
        target_date: m.target_date,
      })),
    };
    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career_prep_dataset_${id.substring(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, roadmap, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: PBI_YELLOW }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-lg text-[var(--color-muted)]">Assessment not found.</p>
        <Link href="/analysis" className="mt-4 text-blue-500 underline">Go back</Link>
      </div>
    );
  }

  const { profile, readiness_score, target_role, skills, questions, courses } = data;
  const presentSkills = skills?.filter((s: any) => s.status === 'present') || [];
  const missingSkills = skills?.filter((s: any) => s.status === 'missing') || [];

  // ── Chart Data Preparations ──

  // Skill status pie
  const skillPieData = [
    { name: 'Present', value: presentSkills.length },
    { name: 'Missing', value: missingSkills.length },
  ];
  const PIE_COLORS = ['#10b981', '#ef4444'];

  // Skill bar chart
  const skillBarData = (skills || []).map((s: any) => ({
    name: s.name.length > 14 ? s.name.substring(0, 12) + '…' : s.name,
    fullName: s.name,
    value: s.status === 'present' ? 100 : 0,
    fill: s.status === 'present' ? '#10b981' : '#ef4444',
  }));

  // Radar chart
  const radarData = (skills || []).map((s: any) => ({
    skill: s.name.length > 10 ? s.name.substring(0, 8) + '…' : s.name,
    score: s.status === 'present' ? 90 : 15,
    fullMark: 100,
  }));

  // Question category breakdown
  const techQs = questions?.filter((q: any) => q.category === 'technical') || [];
  const projQs = questions?.filter((q: any) => q.category === 'project') || [];
  const scenQs = questions?.filter((q: any) => q.category === 'scenario') || [];
  const qCategoryData = [
    { name: 'Technical', count: techQs.length },
    { name: 'Project', count: projQs.length },
    { name: 'Scenario', count: scenQs.length },
  ].filter(d => d.count > 0);

  // Roadmap progress
  const roadmapCompleted = roadmap.filter((m: any) => m.status === 'completed').length;
  const roadmapInProgress = roadmap.filter((m: any) => m.status === 'in_progress').length;
  const roadmapPending = roadmap.filter((m: any) => m.status === 'pending').length;
  const roadmapPieData = [
    { name: 'Completed', value: roadmapCompleted },
    { name: 'In Progress', value: roadmapInProgress },
    { name: 'Pending', value: roadmapPending },
  ].filter(d => d.value > 0);
  const ROADMAP_COLORS = ['#10b981', '#f2c811', '#6b7280'];

  // Course count per skill
  const courseData = Object.entries(courses || {}).map(([skill, list]: [string, any]) => ({
    name: skill.length > 14 ? skill.substring(0, 12) + '…' : skill,
    courses: Array.isArray(list) ? list.length : 0,
  }));

  // Readiness trend (simulated single-point area for visual effect)
  const readinessTrend = [
    { label: 'Start', score: 0 },
    { label: 'Current', score: readiness_score },
    { label: 'Target', score: 100 },
  ];

  // ── Custom Tooltip ──
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ color: PBI_TEXT, fontSize: 12, fontWeight: 600 }}>{label || payload[0].name}</p>
          <p style={{ color: PBI_YELLOW, fontSize: 14, fontWeight: 700 }}>{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: PBI_DARK, minHeight: '100vh', color: PBI_TEXT }}>
      {/* ── Header Bar ── */}
      <div style={{ background: PBI_CARD, borderBottom: `2px solid ${PBI_YELLOW}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href={`/analysis/${id}`} style={{ color: PBI_MUTED, display: 'flex', alignItems: 'center' }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database className="w-6 h-6" style={{ color: PBI_YELLOW }} />
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: PBI_TEXT, lineHeight: 1.2 }}>Power BI Dashboard</h1>
              <p style={{ fontSize: 12, color: PBI_MUTED }}>{target_role} — {new Date(data.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: PBI_MUTED, padding: '4px 10px', background: PBI_DARK, borderRadius: 6, border: `1px solid ${PBI_BORDER}` }}>
            Live Connected
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
        {/* ── KPI CARDS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Readiness Score', value: `${readiness_score}%`, icon: <TrendingUp className="w-5 h-5" />, accent: readiness_score >= 70 ? '#10b981' : readiness_score >= 40 ? PBI_YELLOW : '#ef4444' },
            { label: 'Skills Matched', value: `${presentSkills.length} / ${skills?.length || 0}`, icon: <CheckCircle2 className="w-5 h-5" />, accent: '#10b981' },
            { label: 'Critical Gaps', value: `${missingSkills.length}`, icon: <XCircle className="w-5 h-5" />, accent: '#ef4444' },
            { label: 'Interview Questions', value: `${questions?.length || 0}`, icon: <BarChart3 className="w-5 h-5" />, accent: '#3b82f6' },
            { label: 'Roadmap Milestones', value: `${roadmap.length}`, icon: <Target className="w-5 h-5" />, accent: '#8b5cf6' },
          ].map((kpi, i) => (
            <div key={i} style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: '20px 18px', borderLeft: `4px solid ${kpi.accent}`, transition: 'transform 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: PBI_MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.label}</span>
                <span style={{ color: kpi.accent }}>{kpi.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: PBI_TEXT }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* ── ROW 1: Score Trend + Skill Status Pie ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Readiness Area Chart */}
          <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PBI_TEXT, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity className="w-4 h-4" style={{ color: PBI_YELLOW }} /> Readiness Score Progression
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={readinessTrend}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PBI_YELLOW} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PBI_YELLOW} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={PBI_BORDER} />
                <XAxis dataKey="label" stroke={PBI_MUTED} tick={{ fill: PBI_MUTED, fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke={PBI_MUTED} tick={{ fill: PBI_MUTED, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke={PBI_YELLOW} fill="url(#scoreGrad)" strokeWidth={3} dot={{ fill: PBI_YELLOW, r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Status Donut */}
          <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PBI_TEXT, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieIcon className="w-4 h-4" style={{ color: PBI_YELLOW }} /> Skill Coverage
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={skillPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                  {skillPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── ROW 2: Skill Bar Chart + Radar ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Skills Bar Chart */}
          <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PBI_TEXT, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 className="w-4 h-4" style={{ color: PBI_YELLOW }} /> Skills Gap Analysis
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={skillBarData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={PBI_BORDER} />
                <XAxis type="number" domain={[0, 100]} stroke={PBI_MUTED} tick={{ fill: PBI_MUTED, fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} stroke={PBI_MUTED} tick={{ fill: PBI_MUTED, fontSize: 11 }} />
                <Tooltip content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 8, padding: '10px 14px' }}>
                        <p style={{ color: PBI_TEXT, fontSize: 12, fontWeight: 600 }}>{d.fullName}</p>
                        <p style={{ color: d.value > 0 ? '#10b981' : '#ef4444', fontSize: 14, fontWeight: 700 }}>{d.value > 0 ? 'Present' : 'Missing'}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {skillBarData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Radar */}
          <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PBI_TEXT, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity className="w-4 h-4" style={{ color: PBI_YELLOW }} /> Skill Radar
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke={PBI_BORDER} />
                <PolarAngleAxis dataKey="skill" tick={{ fill: PBI_MUTED, fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: PBI_MUTED, fontSize: 9 }} />
                <Radar name="Skills" dataKey="score" stroke={PBI_YELLOW} fill={PBI_YELLOW} fillOpacity={0.25} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── ROW 3: Question Breakdown + Roadmap Progress ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Question Category */}
          <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PBI_TEXT, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 className="w-4 h-4" style={{ color: PBI_YELLOW }} /> Interview Questions by Category
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={qCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke={PBI_BORDER} />
                <XAxis dataKey="name" stroke={PBI_MUTED} tick={{ fill: PBI_MUTED, fontSize: 11 }} />
                <YAxis stroke={PBI_MUTED} tick={{ fill: PBI_MUTED, fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {qCategoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Roadmap Progress Donut */}
          <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PBI_TEXT, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target className="w-4 h-4" style={{ color: PBI_YELLOW }} /> Roadmap Progress
            </h3>
            {roadmapPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={roadmapPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {roadmapPieData.map((_, i) => (
                      <Cell key={i} fill={ROADMAP_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: PBI_MUTED }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250, color: PBI_MUTED, fontSize: 14 }}>
                No roadmap data yet. Run an analysis first.
              </div>
            )}
          </div>
        </div>

        {/* ── ROW 4: Courses per Skill ── */}
        {courseData.length > 0 && (
          <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PBI_TEXT, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen className="w-4 h-4" style={{ color: PBI_YELLOW }} /> Recommended Courses per Skill
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" stroke={PBI_BORDER} />
                <XAxis dataKey="name" stroke={PBI_MUTED} tick={{ fill: PBI_MUTED, fontSize: 11 }} />
                <YAxis stroke={PBI_MUTED} tick={{ fill: PBI_MUTED, fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="courses" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── ROW 5: Data Tables ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Skills Table */}
          <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PBI_TEXT, marginBottom: 12 }}>Skills Data Table</h3>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PBI_BORDER}` }}>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: PBI_YELLOW, fontWeight: 700 }}>Skill</th>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: PBI_YELLOW, fontWeight: 700 }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: PBI_YELLOW, fontWeight: 700 }}>Required</th>
                  </tr>
                </thead>
                <tbody>
                  {(skills || []).map((s: any, i: number) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${PBI_BORDER}22` }}>
                      <td style={{ padding: '8px 6px', color: PBI_TEXT }}>{s.name}</td>
                      <td style={{ padding: '8px 6px', color: s.status === 'present' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{s.status === 'present' ? '● Present' : '● Missing'}</td>
                      <td style={{ padding: '8px 6px', color: PBI_MUTED }}>{s.is_required ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Questions Table */}
          <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: PBI_TEXT, marginBottom: 12 }}>Interview Data Table</h3>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${PBI_BORDER}` }}>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: PBI_YELLOW, fontWeight: 700 }}>#</th>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: PBI_YELLOW, fontWeight: 700 }}>Question</th>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: PBI_YELLOW, fontWeight: 700 }}>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {(questions || []).map((q: any, i: number) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${PBI_BORDER}22` }}>
                      <td style={{ padding: '8px 6px', color: PBI_MUTED }}>{i + 1}</td>
                      <td style={{ padding: '8px 6px', color: PBI_TEXT, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</td>
                      <td style={{ padding: '8px 6px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: q.category === 'technical' ? '#3b82f622' : q.category === 'project' ? '#f2c81122' : '#10b98122', color: q.category === 'technical' ? '#3b82f6' : q.category === 'project' ? PBI_YELLOW : '#10b981' }}>
                          {q.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Power BI Instructions ── */}
        <div style={{ background: PBI_CARD, border: `1px solid ${PBI_BORDER}`, borderRadius: 10, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Info className="w-5 h-5" style={{ color: PBI_YELLOW }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: PBI_TEXT }}>How to Visualize This in Microsoft Power BI</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <ol style={{ listStyleType: 'decimal', paddingLeft: 20, fontSize: 13, color: PBI_MUTED, lineHeight: 2 }}>
                <li><strong style={{ color: PBI_TEXT }}>Download the dataset</strong> by clicking the button below.</li>
                <li>Open <strong style={{ color: PBI_TEXT }}>Power BI Desktop</strong> (free download from <a href="https://powerbi.microsoft.com/desktop/" target="_blank" rel="noopener noreferrer" style={{ color: PBI_YELLOW, textDecoration: 'underline' }}>powerbi.microsoft.com</a>).</li>
                <li>Click <strong style={{ color: PBI_TEXT }}>Get Data → JSON</strong> and select the downloaded file.</li>
                <li>Power Query Editor will open. Navigate into the <strong style={{ color: PBI_TEXT }}>skills</strong>, <strong style={{ color: PBI_TEXT }}>questions</strong>, and <strong style={{ color: PBI_TEXT }}>roadmap</strong> records.</li>
                <li>Click <strong style={{ color: PBI_TEXT }}>Convert to Table</strong> and expand the columns.</li>
                <li>Click <strong style={{ color: PBI_TEXT }}>Close &amp; Apply</strong>.</li>
              </ol>
            </div>
            <div>
              <ol start={7} style={{ listStyleType: 'decimal', paddingLeft: 20, fontSize: 13, color: PBI_MUTED, lineHeight: 2 }}>
                <li>In the Report view, drag fields to create your visualizations:
                  <ul style={{ listStyleType: 'disc', paddingLeft: 18, lineHeight: 1.8 }}>
                    <li><strong style={{ color: PBI_TEXT }}>Card</strong> → Readiness Score</li>
                    <li><strong style={{ color: PBI_TEXT }}>Pie Chart</strong> → Skills by Status</li>
                    <li><strong style={{ color: PBI_TEXT }}>Bar Chart</strong> → Questions by Category</li>
                    <li><strong style={{ color: PBI_TEXT }}>Table</strong> → Roadmap Milestones</li>
                  </ul>
                </li>
                <li>Publish to <strong style={{ color: PBI_TEXT }}>app.powerbi.com</strong> for sharing!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* ── Download Button ── */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 48px' }}>
          <button
            onClick={handleDownloadDataset}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '16px 40px',
              background: PBI_YELLOW, color: '#000',
              fontSize: 16, fontWeight: 700,
              border: 'none', borderRadius: 12,
              cursor: 'pointer',
              boxShadow: `0 4px 20px ${PBI_YELLOW}44`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = `0 6px 30px ${PBI_YELLOW}66`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 4px 20px ${PBI_YELLOW}44`; }}
          >
            <Download className="w-5 h-5" />
            Download Complete Dataset for Power BI
          </button>
        </div>
      </div>
    </div>
  );
}
