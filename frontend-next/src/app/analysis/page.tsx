'use client';

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileType, X, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AnalysisPage() {
  const router = useRouter();
  
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [mode, setMode] = useState<'role' | 'jd'>('role');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch roles dynamically from the backend just like the old frontend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/analysis/roles');
        setRoles(res.data);
        if (res.data.length > 0) setSelectedRole(res.data[0]);
      } catch (err) {
        console.error("Failed to load roles:", err);
        setError("Failed to load supported roles from the server. Is the backend running?");
      }
    };
    fetchRoles();
  }, []);

  const validateAndSetFile = (f: File) => {
    setError('');
    if (f.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a resume.');
      return;
    }
    if (mode === 'role' && !selectedRole) {
      setError('Please select a target role.');
      return;
    }
    if (mode === 'jd') {
      if (!customRoleTitle.trim()) {
        setError('Please enter a Target Role / Job Title.');
        return;
      }
      if (jobDescription.trim().length < 50) {
        setError('Please paste a comprehensive job description (at least 50 characters).');
        return;
      }
    }

    setIsAnalyzing(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    if (mode === 'role') {
      formData.append('target_role', selectedRole);
    } else {
      formData.append('target_role', customRoleTitle.trim());
      formData.append('job_description', jobDescription);
    }

    try {
      const res = await api.post('/analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Route to Dashboard (which now auto-loads the latest analysis)
      router.push('/');
    } catch (err: any) {
      let errorMessage = 'An error occurred during analysis. Please try again.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map((d: any) => `${d.loc.join('.')}: ${d.msg}`).join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      }
      setError(errorMessage);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">New Career Analysis</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Upload your latest resume and pick your target role to get personalized insights.</p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Target Job Column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-foreground)]">1. Target Job</h3>
              <div className="flex bg-[var(--color-background)] rounded-lg p-1 border border-[var(--color-border)]">
                <button
                  onClick={() => setMode('role')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'role' ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm' : 'text-[var(--color-muted)]'
                  }`}
                >
                  Select Role
                </button>
                <button
                  onClick={() => setMode('jd')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'jd' ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm' : 'text-[var(--color-muted)]'
                  }`}
                >
                  Paste JD
                </button>
              </div>
            </div>
            
            {mode === 'role' ? (
              <div className="space-y-3">
                {roles.length === 0 ? (
                  <div className="animate-pulse h-12 bg-[var(--color-background)] rounded-lg"></div>
                ) : (
                  roles.map((role) => (
                    <label 
                      key={role}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedRole === role 
                          ? 'bg-blue-50 border-[var(--color-accent)]' 
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-background)]'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="role" 
                        value={role}
                        checked={selectedRole === role}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="hidden"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${
                        selectedRole === role ? 'border-[var(--color-accent)]' : 'border-[var(--color-muted)]'
                      }`}>
                        {selectedRole === role && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"></div>}
                      </div>
                      <span className={`font-medium ${selectedRole === role ? 'text-[var(--color-accent)]' : 'text-[var(--color-foreground)]'}`}>
                        {role}
                      </span>
                    </label>
                  ))
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5 text-left">Job Title / Target Role</label>
                  <input
                    type="text"
                    value={customRoleTitle}
                    onChange={(e) => setCustomRoleTitle(e.target.value)}
                    placeholder="e.g., Senior React Developer"
                    className="w-full p-3.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5 text-left">Job Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full h-full min-h-[190px] p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Upload Column */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">2. Upload Resume</h3>
            
            {!file ? (
              <div 
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all h-[300px] cursor-pointer ${
                  isDragging 
                    ? 'border-[var(--color-accent)] bg-blue-50' 
                    : 'border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-muted)]'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                  <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'}`} />
                </div>
                <p className="text-[var(--color-foreground)] font-medium mb-2">Drag and drop your resume</p>
                <p className="text-[var(--color-muted)] text-sm mb-6">PDF files up to 10MB</p>
                
                <span className="px-4 py-2 bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm font-medium rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-background)] transition-colors">
                  Browse Files
                </span>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
                  }}
                />
              </div>
            ) : (
              <div className="border border-[var(--color-border)] rounded-xl p-6 bg-[var(--color-background)] flex flex-col h-[300px] relative">
                <button 
                  onClick={() => setFile(null)}
                  className="absolute top-4 right-4 p-1.5 bg-[var(--color-surface)] hover:bg-red-50 border border-[var(--color-border)] hover:border-red-200 text-[var(--color-muted)] hover:text-red-600 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <FileType className="w-16 h-16 text-[var(--color-accent)] mb-4" />
                  <p className="text-[var(--color-foreground)] font-medium truncate w-full max-w-[250px] px-4">
                    {file.name}
                  </p>
                  <p className="text-[var(--color-muted)] text-sm mt-2">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  
                  <div className="mt-8 flex items-center text-green-700 text-sm font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Ready for analysis
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!file || (mode === 'role' && !selectedRole) || isAnalyzing}
            className={`flex items-center px-8 py-3 rounded-xl font-medium transition-all ${
              (!file || (mode === 'role' && !selectedRole))
                ? 'bg-[var(--color-background)] text-[var(--color-muted)] border border-[var(--color-border)] cursor-not-allowed'
                : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Analyzing Profile...
              </>
            ) : (
              'Run AI Analysis'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
