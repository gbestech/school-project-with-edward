
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader, Key, Download, Printer, Eye, Search, Copy, Check, RefreshCw, Trash2, Calendar, Clock } from 'lucide-react';

interface GenerationResult {
  success: boolean;
  message: string;
  school_term: string;
  academic_session: string;
  tokens_created: number;
  tokens_updated: number;
  total_students: number;
  expires_at: string;
  days_until_expiry: number;
  expiry_date: string;
  errors?: Array<{ student_id: number; username: string; error: string }>;
  error_count?: number;
}

interface StudentToken {
  id: number;
  student_name: string;
  username: string;
  student_class: string;
  token: string;
  expires_at: string;
  is_valid?: boolean;
  status?: string;
}

const AdminResultTokenGenerator = () => {
  const [termId, setTermId] = useState('');
  const [daysUntilExpiry, setDaysUntilExpiry] = useState('30');
  const [viewTermId, setViewTermId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [tokens, setTokens] = useState<StudentToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tokenStats, setTokenStats] = useState<any>(null);

  const API_BASE_URL = 'https://school-project-with-edward.onrender.com/api';

  const getAuthToken = () => {
    const tokenKeys = ['authToken', 'token', 'access_token', 'accessToken', 'jwt'];
    for (const key of tokenKeys) {
      const val = localStorage.getItem(key);
      if (val) return val;
    }
    return null;
  };

  const generateTokens = async () => {
    if (!termId) {
      setError('Please enter Term ID');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setSuccess(false);
      setResult(null);
      
      const authToken = getAuthToken();
      if (!authToken) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const requestBody: any = { school_term_id: parseInt(termId) };
      
      if (daysUntilExpiry && parseInt(daysUntilExpiry) > 0) {
        requestBody.days_until_expiry = parseInt(daysUntilExpiry);
      }

      const response = await fetch(`${API_BASE_URL}/api/students/admin/generate-result-tokens/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have admin privileges.');
        } else if (response.status === 404) {
          throw new Error('School term not found. Please check the Term ID.');
        }
        
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
        } else {
          throw new Error(`Server error (${response.status}). Please try again.`);
        }
      }

      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid server response. Please contact support.');
      }

      const data = await response.json();
      console.log('Token generation response:', data);
      
      // Log errors if they exist
      if (data.errors && data.errors.length > 0) {
        console.error('Token generation errors:', data.errors);
        console.error('First 5 errors:', data.errors.slice(0, 5));
      }
      
      setResult(data);
      setSuccess(true);
      setViewTermId(termId);
      
      // Only fetch tokens if some were actually created
      if (data.total_students > 0 || data.tokens_created > 0 || data.tokens_updated > 0) {
        await fetchTokens(termId);
      } else if (data.error_count > 0) {
        setError(`Token generation failed for all ${data.error_count} students. Check console for error details.`);
      } else {
        setError('Token generation succeeded but no tokens were created. This term may have no enrolled students.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate tokens. Please try again.');
      setSuccess(false);
    } finally {
      setGenerating(false);
    }
  };

  const fetchTokens = async (termIdToFetch?: string) => {
    const targetTermId = termIdToFetch || viewTermId;
    if (!targetTermId) {
      setError('Please enter a Term ID to view tokens');
      return;
    }
    
    try {
      setLoadingTokens(true);
      setError(null);
      const authToken = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/students/admin/get-all-result-tokens/?school_term_id=${targetTermId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens || []);
        setTokenStats(data.statistics || null);
        setShowTokens(true);
        setViewTermId(targetTermId);
      } else if (response.status === 404) {
        setError('No tokens found for this term. Please generate tokens first.');
        setTokens([]);
        setShowTokens(false);
      } else {
        setError('Failed to fetch tokens. Please try again.');
      }
    } catch (err) {
      setError('Failed to fetch tokens. Please try again.');
    } finally {
      setLoadingTokens(false);
    }
  };

  const deleteExpiredTokens = async () => {
    if (!confirm('Are you sure you want to delete ALL expired tokens across all terms?')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      const authToken = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/students/admin/delete-expired-tokens/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully deleted ${data.deleted_count} expired tokens`);
        
        if (viewTermId) {
          await fetchTokens();
        }
      } else {
        setError('Failed to delete expired tokens');
      }
    } catch (err) {
      setError('Failed to delete expired tokens');
    } finally {
      setDeleting(false);
    }
  };

  const deleteAllTokensForTerm = async () => {
    if (!viewTermId) {
      setError('Please view tokens for a term first');
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL tokens for Term ${viewTermId}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      const authToken = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/students/admin/delete-all-tokens-for-term/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ school_term_id: parseInt(viewTermId) })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setTokens([]);
        setShowTokens(false);
        setTokenStats(null);
      } else {
        setError('Failed to delete tokens');
      }
    } catch (err) {
      setError('Failed to delete tokens');
    } finally {
      setDeleting(false);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const exportToCSV = () => {
    const headers = ['Student Name', 'Username', 'Class', 'Token', 'Expires At', 'Status'];
    const rows = filteredTokens.map(t => [
      t.student_name,
      t.username,
      t.student_class,
      t.token,
      new Date(t.expires_at).toLocaleDateString(),
      t.status || 'Active'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `result_tokens_term_${viewTermId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const printTokens = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Result Tokens - Term ${viewTermId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 10px; }
            .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #4F46E5; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .token { font-family: 'Courier New', monospace; font-size: 13px; font-weight: bold; }
            .active { color: green; }
            .expired { color: red; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Result Access Tokens</h1>
          <p class="subtitle">Term ${viewTermId} • Generated: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Username</th>
                <th>Class</th>
                <th>Token</th>
                <th>Expires</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTokens.map(t => `
                <tr>
                  <td>${t.student_name}</td>
                  <td>${t.username}</td>
                  <td>${t.student_class}</td>
                  <td class="token">${t.token}</td>
                  <td>${new Date(t.expires_at).toLocaleDateString()}</td>
                  <td class="${t.status === 'Active' ? 'active' : 'expired'}">${t.status || 'Active'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredTokens = tokens.filter(t => 
    t.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.student_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.token.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            🔐 Result Token Management
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
            Generate human-readable tokens or manage existing tokens for any term
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
                <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Generate New Tokens Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Key size={24} className="text-blue-600" />
              Generate New Tokens
            </h2>

            {success && result && (
              <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-green-800 dark:text-green-300 text-lg">Success!</h3>
                    <p className="text-green-700 dark:text-green-400 text-sm mt-1">{result.message}</p>
                    <p className="text-green-600 dark:text-green-500 text-sm mt-1">
                      {result.school_term} • {result.academic_session}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="font-semibold">Expiry Date:</span>
                    <span>{result.expiry_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Clock size={16} className="text-blue-600" />
                    <span className="font-semibold">Days Until Expiry:</span>
                    <span className="font-bold text-blue-600">{result.days_until_expiry} days</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-slate-400 text-xs font-semibold">Created</p>
                    <p className={`text-xl font-bold mt-1 ${
                      result.tokens_created > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {result.tokens_created}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-slate-400 text-xs font-semibold">Updated</p>
                    <p className={`text-xl font-bold mt-1 ${
                      result.tokens_updated > 0 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {result.tokens_updated}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-slate-400 text-xs font-semibold">Total</p>
                    <p className={`text-xl font-bold mt-1 ${
                      result.total_students > 0 
                        ? 'text-gray-800 dark:text-white' 
                        : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {result.total_students}
                    </p>
                  </div>
                </div>

                {result.total_students === 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      ⚠️ No students found for this term. Please check if students are enrolled in Term {termId}.
                    </p>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-h-60 overflow-y-auto">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                          {result.error_count} Error{result.error_count !== 1 ? 's' : ''} Occurred
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                          First few errors (check console for all):
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      {result.errors.slice(0, 10).map((err, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-2 rounded text-xs">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {err.username || `Student ID: ${err.student_id}`}
                          </span>
                          <span className="text-red-600 dark:text-red-400 ml-2">
                            {err.error}
                          </span>
                        </div>
                      ))}
                      {result.errors.length > 10 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                          ...and {result.errors.length - 10} more errors (see console)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setResult(null);
                    setSuccess(false);
                    setError(null);
                    setTermId('');
                  }}
                  className="w-full mt-4 py-2 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-lg transition-colors font-medium"
                >
                  Generate Another
                </button>
              </div>
            )}

            {!success && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                    Term ID *
                  </label>
                  <input
                    type="number"
                    value={termId}
                    onChange={(e) => setTermId(e.target.value)}
                    placeholder="e.g., 1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                    Days Until Expiry (Optional)
                  </label>
                  <input
                    type="number"
                    value={daysUntilExpiry}
                    onChange={(e) => setDaysUntilExpiry(e.target.value)}
                    placeholder="e.g., 30, 60, 90"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Leave empty to use term end date. Default: 30 days
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>📝 Token Format:</strong> New tokens are human-readable (e.g., <code className="bg-white dark:bg-slate-700 px-2 py-1 rounded font-mono">A7B-2C9-X3Y-5Z1</code>)
                  </p>
                </div>

                <button
                  onClick={generateTokens}
                  disabled={generating || !termId}
                  className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    generating || !termId
                      ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {generating ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key size={20} />
                      Generate Tokens
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* View & Manage Tokens Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Eye size={24} className="text-purple-600" />
              View & Manage Tokens
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                  Term ID *
                </label>
                <input
                  type="number"
                  value={viewTermId}
                  onChange={(e) => setViewTermId(e.target.value)}
                  placeholder="e.g., 1, 2, 3..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={() => fetchTokens()}
                disabled={loadingTokens || !viewTermId}
                className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  loadingTokens || !viewTermId
                    ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {loadingTokens ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Eye size={20} />
                    View Tokens
                  </>
                )}
              </button>

              {showTokens && (
                <div className="space-y-2">
                  <button
                    onClick={() => fetchTokens()}
                    disabled={loadingTokens}
                    className="w-full py-2 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>

                  <button
                    onClick={deleteAllTokensForTerm}
                    disabled={deleting}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete All Tokens for This Term
                      </>
                    )}
                  </button>

                  <button
                    onClick={deleteExpiredTokens}
                    disabled={deleting}
                    className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete All Expired Tokens
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Token Statistics */}
        {showTokens && tokenStats && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-slate-700 mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Token Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tokenStats.total}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{tokenStats.active}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{tokenStats.expired}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Used</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tokenStats.used}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tokens List */}
        {showTokens && tokens.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Tokens for Term {viewTermId} ({filteredTokens.length} students)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Download size={16} />
                  CSV
                </button>
                <button
                  onClick={printTokens}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, username, class, or token..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Expires</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTokens.map((token) => {
                      const expired = isTokenExpired(token.expires_at);
                      return (
                        <tr key={token.id} className="border-b border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{token.student_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{token.username}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{token.student_class}</td>
                          <td className="px-4 py-3">
                            <code className="text-sm font-mono bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                              {token.token}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(token.expires_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              expired 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            }`}>
                              {expired ? 'Expired' : token.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => copyToken(token.token)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                              title="Copy token"
                            >
                              {copiedToken === token.token ? (
                                <Check size={16} className="text-green-600 dark:text-green-400" />
                              ) : (
                                <Copy size={16} className="text-gray-600 dark:text-gray-400" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredTokens.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tokens found matching your search.
              </div>
            )}
          </div>
        )}

        {showTokens && tokens.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700 text-center">
            <AlertCircle className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Tokens Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate tokens for Term {viewTermId} to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResultTokenGenerator;