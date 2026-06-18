'use client';

import { useState } from 'react';
import { Loader2, Database, X } from 'lucide-react';
import { api } from '@/lib/api';

interface PowerBIModalProps {
  assessmentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PowerBIModal({ assessmentId, isOpen, onClose }: PowerBIModalProps) {
  const [pushUrl, setPushUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushUrl) {
      setError('Please enter a valid Power BI Push URL');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post(`/export/powerbi/${assessmentId}`, { push_url: pushUrl });
      setSuccess('Successfully pushed all assessment and roadmap data to Power BI!');
      setTimeout(() => {
        onClose();
        setSuccess('');
        setPushUrl('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to connect to Power BI. Please check your URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--color-border)] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-foreground)]">Connect to Power BI</h3>
            </div>
            <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
                Power BI Streaming Dataset URL
              </label>
              <input
                type="url"
                value={pushUrl}
                onChange={(e) => setPushUrl(e.target.value)}
                placeholder="https://api.powerbi.com/beta/..."
                className="w-full px-4 py-2.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all"
                required
              />
              <p className="text-xs text-[var(--color-muted)] mt-2">
                Paste the Push URL from your Power BI Streaming Dataset to sync all assessment, skill gap, and roadmap visualizations.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success !== ''}
              className="w-full mt-6 px-4 py-2.5 bg-yellow-500 text-white font-medium rounded-xl hover:bg-yellow-600 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sync Data'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
