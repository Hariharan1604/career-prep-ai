'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  BrainCircuit, History, CheckCircle2, XCircle, AlertTriangle, Play, ChevronRight, Loader2, ArrowLeft 
} from 'lucide-react';

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<'assessment' | 'history'>('assessment');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  // Assessment State
  const [currentTest, setCurrentTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<any>(null);
  
  // History Detail State
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assessment/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/assessment/generate');
      setCurrentTest(res.data);
      setAnswers({});
      setResults(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAssessment = async () => {
    if (!currentTest) return;
    setLoading(true);
    try {
      const res = await api.post(`/assessment/${currentTest.id}/submit`, { answers });
      setResults(res.data);
      setCurrentTest(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewHistoryDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/assessment/${id}`);
      setSelectedHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderAssessmentTest = () => {
    if (results) {
      return (
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">Assessment Completed!</h2>
            <p className="text-[var(--color-muted)] mb-6">You scored {Math.round(results.score)}% ({results.correct_answers} out of {results.total_questions} correct)</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setResults(null)}
                className="px-6 py-2.5 bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] font-medium rounded-xl hover:bg-gray-50 transition-all"
              >
                Back to Start
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[var(--color-foreground)] border-b border-[var(--color-border)] pb-2">Review Your Answers</h3>
            {results.answers.map((ans: any, idx: number) => (
              <div key={ans.question_id} className={`p-6 rounded-xl border ${ans.is_correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                <div className="flex items-start mb-4">
                  {ans.is_correct ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="font-semibold text-[var(--color-foreground)]">{idx + 1}. {ans.question_text}</h4>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--color-background)] border border-[var(--color-border)] text-xs rounded text-[var(--color-muted)] font-medium">
                      {ans.skill_area}
                    </span>
                  </div>
                </div>

                <div className="ml-9 space-y-2 mb-4">
                  {ans.options.map((opt: string, oIdx: number) => {
                    let optClass = "p-3 rounded-lg border text-sm ";
                    if (oIdx === ans.correct_option) {
                      optClass += "border-green-500 bg-green-100 text-green-800 font-medium";
                    } else if (oIdx === ans.selected_option && !ans.is_correct) {
                      optClass += "border-red-500 bg-red-100 text-red-800 font-medium";
                    } else {
                      optClass += "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] opacity-60";
                    }
                    return (
                      <div key={oIdx} className={optClass}>
                        {opt}
                      </div>
                    );
                  })}
                  {ans.selected_option === null && (
                    <p className="text-sm text-red-500 font-medium italic mt-2">You did not answer this question.</p>
                  )}
                </div>

                {!ans.is_correct && ans.explanation && (
                  <div className="ml-9 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Insight & Explanation</h5>
                    <p className="text-sm text-blue-900 leading-relaxed">{ans.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentTest) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl shadow-sm">
            <h2 className="font-bold text-[var(--color-foreground)]">{currentTest.title}</h2>
            <span className="text-sm text-[var(--color-muted)] font-medium">
              {Object.keys(answers).length} of {currentTest.questions.length} Answered
            </span>
          </div>

          <div className="space-y-6">
            {currentTest.questions.map((q: any, idx: number) => (
              <div key={q.id} className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm">
                <div className="flex items-start mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[var(--color-accent)] font-bold text-sm mr-4 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-[var(--color-foreground)] leading-relaxed">{q.question_text}</h3>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-[var(--color-background)] border border-[var(--color-border)] text-xs rounded text-[var(--color-muted)] font-medium">
                      {q.skill_area}
                    </span>
                  </div>
                </div>
                
                <div className="ml-12 space-y-2">
                  {q.options.map((opt: string, oIdx: number) => (
                    <label 
                      key={oIdx} 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        answers[q.id] === oIdx 
                          ? 'border-[var(--color-accent)] bg-blue-50' 
                          : 'border-[var(--color-border)] hover:bg-[var(--color-background)]'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        value={oIdx}
                        checked={answers[q.id] === oIdx}
                        onChange={() => setAnswers({...answers, [q.id]: oIdx})}
                        className="w-4 h-4 text-[var(--color-accent)] border-gray-300 focus:ring-[var(--color-accent)]"
                      />
                      <span className={`ml-3 text-sm ${answers[q.id] === oIdx ? 'font-medium text-[var(--color-accent)]' : 'text-[var(--color-foreground)]'}`}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
            <button
              onClick={submitAssessment}
              disabled={loading || Object.keys(answers).length < currentTest.questions.length}
              className="px-8 py-3 bg-[var(--color-accent)] text-white font-semibold rounded-xl hover:bg-[var(--color-accent-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Submit Answers
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center shadow-sm flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <BrainCircuit className="w-10 h-10 text-[var(--color-accent)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">Skill Assessment Test</h2>
        <p className="text-[var(--color-muted)] max-w-lg mb-8">
          Take a 10-question multiple-choice assessment tailored to your skill gaps. 
          We'll provide a score, correct answers, and insights for any questions you miss to help you learn.
        </p>
        <button
          onClick={startAssessment}
          disabled={loading}
          className="flex items-center px-8 py-3 bg-[var(--color-accent)] text-white font-semibold rounded-xl shadow-md hover:bg-[var(--color-accent-hover)] transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2" />}
          Start Assessment
        </button>
      </div>
    );
  };

  const renderHistory = () => {
    if (selectedHistory) {
      return (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedHistory(null)}
            className="flex items-center text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to History
          </button>
          
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-foreground)]">{selectedHistory.title || 'Assessment Result'}</h2>
              <p className="text-[var(--color-muted)] text-sm mt-1">Score: {Math.round(selectedHistory.score)}% ({selectedHistory.correct_answers}/{selectedHistory.total_questions})</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
              selectedHistory.score >= 80 ? 'bg-green-100 text-green-700' :
              selectedHistory.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {Math.round(selectedHistory.score)}%
            </div>
          </div>

          <div className="space-y-4">
            {selectedHistory.answers.map((ans: any, idx: number) => (
              <div key={ans.question_id} className={`p-6 rounded-xl border ${ans.is_correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                <div className="flex items-start mb-4">
                  {ans.is_correct ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="font-semibold text-[var(--color-foreground)]">{idx + 1}. {ans.question_text}</h4>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--color-background)] border border-[var(--color-border)] text-xs rounded text-[var(--color-muted)] font-medium">
                      {ans.skill_area}
                    </span>
                  </div>
                </div>

                <div className="ml-9 space-y-2 mb-4">
                  {ans.options.map((opt: string, oIdx: number) => {
                    let optClass = "p-3 rounded-lg border text-sm ";
                    if (oIdx === ans.correct_option) {
                      optClass += "border-green-500 bg-green-100 text-green-800 font-medium";
                    } else if (oIdx === ans.selected_option && !ans.is_correct) {
                      optClass += "border-red-500 bg-red-100 text-red-800 font-medium";
                    } else {
                      optClass += "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] opacity-60";
                    }
                    return (
                      <div key={oIdx} className={optClass}>
                        {opt}
                      </div>
                    );
                  })}
                </div>

                {!ans.is_correct && ans.explanation && (
                  <div className="ml-9 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Insight & Explanation</h5>
                    <p className="text-sm text-blue-900 leading-relaxed">{ans.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
        </div>
      );
    }

    if (history.length === 0) {
      return (
        <div className="text-center p-12 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
          <History className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">No History Yet</h3>
          <p className="text-[var(--color-muted)]">Take an assessment to see your past results here.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {history.map((item) => (
          <div 
            key={item.id} 
            onClick={() => viewHistoryDetail(item.id)}
            className="flex items-center justify-between p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] hover:shadow-md transition-all cursor-pointer group"
          >
            <div>
              <h3 className="font-bold text-[var(--color-foreground)] mb-1">{item.title}</h3>
              <p className="text-sm text-[var(--color-muted)]">
                {new Date(item.created_at).toLocaleDateString()} • {item.correct_answers}/{item.total_questions} Correct
              </p>
            </div>
            <div className="flex items-center">
              <div className="text-right mr-6">
                <span className="block text-xl font-bold text-[var(--color-foreground)]">{Math.round(item.score)}%</span>
                <span className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Score</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">Insights & Assessments</h1>
        <p className="text-[var(--color-muted)]">Test your knowledge and review AI-generated insights based on your skill gaps.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-[var(--color-border)]">
        <button
          onClick={() => { setActiveTab('assessment'); setSelectedHistory(null); }}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'assessment' 
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]' 
              : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
          }`}
        >
          <div className="flex items-center">
            <BrainCircuit className="w-4 h-4 mr-2" />
            Take Assessment
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'history' 
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]' 
              : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
          }`}
        >
          <div className="flex items-center">
            <History className="w-4 h-4 mr-2" />
            Assessment History
          </div>
        </button>
      </div>

      {/* Content area */}
      <div className="pt-2">
        {activeTab === 'assessment' ? renderAssessmentTest() : renderHistory()}
      </div>
    </div>
  );
}
