'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AlertCircle, Target, Briefcase, FileText, CheckCircle2, Download, Loader2, ArrowRight, Server, Zap, ShieldAlert, ChevronDown, ChevronUp, GraduationCap, Database } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AnalysisResultPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  // Accordion state for questions
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/analysis/${id}`);
        setData(res.data);
      } catch (err) {
        setError('Failed to load analysis results. They may have been deleted or belong to another account.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const res = await api.get(`/export/pdf/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `career_prep_analysis_${id.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('PDF Export failed', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[var(--color-accent)] animate-spin mb-4" />
        <h3 className="text-xl font-medium text-[var(--color-foreground)]">Loading your results...</h3>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 rounded-xl border border-red-200 bg-red-50 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-red-700 mb-2">Assessment Not Found</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <Link href="/analysis" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
          Start New Analysis
        </Link>
      </div>
    );
  }

  const { profile, readiness_score, target_role, job_description_text, skills, questions, courses } = data;
  const presentSkills = skills.filter((s: any) => s.status === 'present');
  const missingSkills = skills.filter((s: any) => s.status === 'missing');
  const requiredMissing = missingSkills.filter((s: any) => s.is_required);

  // Group questions
  const groupedQs = {
    technical: questions.filter((q: any) => q.category === 'technical'),
    project: questions.filter((q: any) => q.category === 'project'),
    scenario: questions.filter((q: any) => q.category === 'scenario'),
  };

  const getQIcon = (cat: string) => {
    switch(cat) {
      case 'technical': return <Server className="w-5 h-5 text-[var(--color-accent)]" />;
      case 'project': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'scenario': return <ShieldAlert className="w-5 h-5 text-green-500" />;
      default: return null;
    }
  };

  const radarData = skills.map((skill: any) => ({
    subject: skill.name.length > 12 ? skill.name.substring(0, 10) + '...' : skill.name,
    score: skill.status === 'present' ? 100 : 20,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* HEADER & EXPORT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-sm text-[var(--color-accent)] font-medium mb-1">
            <Target className="w-4 h-4 mr-1.5" />
            Target Role Analysis
          </div>
          <h2 className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight">{target_role}</h2>
          <p className="text-[var(--color-muted)] mt-1 text-sm">Analysis generated on {new Date(data.created_at).toLocaleDateString()}</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Link
            href={`/analysis/${id}/powerbi`}
            className="flex items-center px-4 py-2 bg-[#f2c811] text-black font-medium rounded-xl hover:bg-yellow-500 transition-colors shadow-sm"
          >
            <Database className="w-4 h-4 mr-2" />
            Power BI Dashboard
          </Link>
          
          <button 
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center px-4 py-2 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {isExportingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Download Report
          </button>
        </div>
      </div>

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)] mb-4">Readiness Score</h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-[var(--color-background)]" strokeWidth="3" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`${readiness_score >= 70 ? 'text-green-500' : readiness_score >= 40 ? 'text-yellow-500' : 'text-red-500'}`} 
                strokeDasharray={`${readiness_score}, 100`} strokeWidth="3" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-[var(--color-foreground)]">{readiness_score}</span>
              <span className="text-xs text-[var(--color-muted)]">%</span>
            </div>
          </div>
          <div className="mt-6 text-center text-sm">
            {readiness_score >= 70 ? (
              <p className="text-green-600 font-medium">You are well positioned for this role!</p>
            ) : readiness_score >= 40 ? (
              <p className="text-yellow-600 font-medium">Solid foundation. Focus on the gaps.</p>
            ) : (
              <p className="text-red-600 font-medium">Significant upskilling recommended.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:col-span-2 flex flex-col shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 border-b border-[var(--color-border)] pb-2">Profile Extracted</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 flex-1">
            <div>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold mb-1">Candidate Details</p>
              <p className="text-[var(--color-foreground)] font-medium">{profile?.name || 'Not detected'}</p>
              <p className="text-[var(--color-muted)] text-sm mt-0.5">{profile?.email || 'No email detected'}</p>
              <p className="text-[var(--color-muted)] text-sm mt-0.5">{profile?.phone || 'No phone detected'}</p>
            </div>
            
            <div>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold mb-1">Education</p>
              {profile?.education && profile.education.length > 0 ? (
                profile.education.map((edu: any, i: number) => (
                  <div key={i} className="flex items-start mb-1">
                    <GraduationCap className="w-4 h-4 text-[var(--color-accent)] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--color-foreground)] text-sm">{edu.degree}</span>
                  </div>
                ))
              ) : (
                <span className="text-[var(--color-muted)] text-sm italic">No education extracted</span>
              )}
            </div>

            <div className="md:col-span-2 pt-2 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold mb-2">Projects Found</p>
              <div className="flex flex-wrap gap-2">
                {profile?.projects && profile.projects.length > 0 ? (
                  profile.projects.map((proj: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded text-xs text-[var(--color-foreground)]">
                      {proj}
                    </span>
                  ))
                ) : (
                  <span className="text-[var(--color-muted)] text-sm italic">No specific projects extracted</span>
                )}
              </div>
            </div>
            
            {job_description_text && (
              <div className="md:col-span-2 pt-2 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold mb-2">Custom Job Description</p>
                <div className="p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg max-h-24 overflow-y-auto text-sm text-[var(--color-foreground)]">
                  {job_description_text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: SKILL GAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 border-b border-[var(--color-border)] pb-2">Skill Visualization</h3>
          <div className="flex-1 flex items-center justify-center min-h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Candidate" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:col-span-2 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 border-b border-[var(--color-border)] pb-2">Gap Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                <h4 className="font-medium text-[var(--color-foreground)]">Matching Skills ({presentSkills.length})</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {presentSkills.map((s: any, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-full">
                    {s.name}
                  </span>
                ))}
                {presentSkills.length === 0 && <span className="text-[var(--color-muted)] text-sm italic">No matching skills found.</span>}
              </div>
            </div>
            <div>
              <div className="flex items-center mb-4">
                <ShieldAlert className="w-5 h-5 text-red-500 mr-2" />
                <h4 className="font-medium text-[var(--color-foreground)]">Missing Critical Skills ({requiredMissing.length})</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {requiredMissing.map((s: any, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-full">
                    {s.name}
                  </span>
                ))}
                {requiredMissing.length === 0 && <span className="text-[var(--color-muted)] text-sm italic">You have all required skills!</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERVIEW QUESTIONS */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="mb-8 border-b border-[var(--color-border)] pb-4">
          <h3 className="text-xl font-bold text-[var(--color-foreground)] flex items-center">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-[var(--color-accent)] border border-blue-100 flex items-center justify-center mr-3">
              <Briefcase className="w-5 h-5" />
            </span>
            Instant & Personalized Interview Prep
          </h3>
          <p className="text-[var(--color-muted)] mt-1 ml-11 text-sm">Tailored questions generated by AI based on your exact profile and target role.</p>
        </div>
        
        <div>
          {[
            { title: "Technical Questions", list: groupedQs.technical, key: "technical" },
            { title: "Project-Based", list: groupedQs.project, key: "project" },
            { title: "Scenario & Behavioral", list: groupedQs.scenario, key: "scenario" },
          ].map((group) => {
            if (group.list.length === 0) return null;
            return (
              <div key={group.key} className="mb-8 last:mb-0">
                <div className="flex items-center mb-4">
                  {getQIcon(group.key)}
                  <h4 className="text-lg font-semibold text-[var(--color-foreground)] ml-2">{group.title}</h4>
                  <span className="ml-3 px-2 py-0.5 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-muted)] text-xs font-medium">
                    {group.list.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {group.list.map((q: any, idx: number) => {
                    const uniqueId = `${group.key}-${idx}`;
                    const isOpen = openIndex === uniqueId;
                    return (
                      <div 
                        key={uniqueId} 
                        className={`border rounded-lg transition-all duration-200 ${
                          isOpen ? 'border-[var(--color-accent)] bg-blue-50/30' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-background)]'
                        }`}
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : uniqueId)}
                          className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                        >
                          <div className="flex items-start">
                            <span className="text-[var(--color-muted)] font-mono text-sm mr-3 mt-0.5">{idx + 1}.</span>
                            <span className={`font-medium text-sm leading-relaxed ${isOpen ? 'text-[var(--color-accent)]' : 'text-[var(--color-foreground)]'}`}>
                              {q.question}
                            </span>
                          </div>
                          <div className="ml-4 flex-shrink-0 text-[var(--color-muted)]">
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 ml-6 space-y-4">
                            {q.answer && (
                              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                                <h5 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">Suggested Answer</h5>
                                <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{q.answer}</p>
                              </div>
                            )}
                            {q.key_points && q.key_points.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">Key Points to Mention</h5>
                                <ul className="space-y-1.5">
                                  {q.key_points.map((kp: string, i: number) => (
                                    <li key={i} className="flex items-start text-sm text-[var(--color-foreground)]">
                                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                      <span>{kp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-3 pt-2">
                              {q.skill && (
                                <span className="px-2.5 py-1 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-foreground)] font-medium">
                                  Target Skill: <span className="font-semibold">{q.skill}</span>
                                </span>
                              )}
                              {q.is_gap && (
                                <span className="px-2.5 py-1 rounded bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                                  Skill Gap Question
                                </span>
                              )}
                              <span className="px-2.5 py-1 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-xs text-[var(--color-muted)] font-medium">
                                Relevance: {Math.round(q.relevance_score * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COURSE RECOMMENDATIONS */}
      {Object.keys(courses).length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-[var(--color-accent)]" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-2">Ready to close your skill gaps?</h3>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            We've curated a personalized roadmap with recommended courses for each of your missing skills.
          </p>
          <Link
            href="/roadmap"
            className="flex items-center justify-center px-6 py-3 bg-[var(--color-accent)] text-white font-semibold rounded-xl shadow-md hover:bg-[var(--color-accent-hover)] transition-all"
          >
            View Career Roadmap <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )}


    </div>
  );
}
