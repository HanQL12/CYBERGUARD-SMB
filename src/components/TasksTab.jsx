import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Mail, CheckCircle2, Clock, AlertTriangle, Zap, RefreshCw, Filter, Eye, Shield } from 'lucide-react';
import { apiCall, apiCallWithRetry } from '../config/api';

const TasksTab = () => {
  const [filter, setFilter] = useState('all'); // 'all', 'processed', 'unprocessed'
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processedEmails, setProcessedEmails] = useState([]);
  const [unprocessedEmails, setUnprocessedEmails] = useState([]);

  // Fetch emails data
  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiCallWithRetry('/tasks-data', {
        method: 'GET'
      }, 2);

      if (result.success && result.data) {
        setProcessedEmails(result.data.processed || []);
        setUnprocessedEmails(result.data.unprocessed || []);
      }
    } catch (error) {
      console.error('Error fetching tasks data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Filter emails based on selected filter
  const filteredEmails = useMemo(() => {
    if (filter === 'processed') {
      return processedEmails;
    } else if (filter === 'unprocessed') {
      return unprocessedEmails;
    } else {
      return [...unprocessedEmails, ...processedEmails];
    }
  }, [filter, processedEmails, unprocessedEmails]);

  // Scan single email immediately
  const handleScanEmail = useCallback(async (email) => {
    try {
      setProcessing(true);
      const result = await apiCallWithRetry('/scan-email-urgent', {
        method: 'POST',
        body: JSON.stringify({ email_id: email.id })
      }, 2);

      if (result && result.success) {
        // Refresh emails after scanning
        await fetchEmails();
        alert(`Đã quét email: ${email.subject || 'No subject'}`);
      } else {
        alert('Lỗi khi quét email');
      }
    } catch (error) {
      console.error('Error scanning email:', error);
      alert('Lỗi khi quét email: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }, [fetchEmails]);

  // Scan all unprocessed emails
  const handleScanAll = useCallback(async () => {
    if (unprocessedEmails.length === 0) {
      alert('Không có email nào cần xử lý');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn quét ${unprocessedEmails.length} email chưa xử lý?`)) {
      return;
    }

    try {
      setProcessing(true);
      const response = await apiCallWithRetry('/scan-emails-urgent', {
        method: 'POST',
        body: JSON.stringify({ 
          email_ids: unprocessedEmails.map(e => e.id)
        })
      }, 2);

      if (response.success) {
        await fetchEmails();
        const data = response.data || response;
        const processed = data.processed_count || unprocessedEmails.length;
        const phishing = data.phishing_count || 0;
        const safe = data.safe_count || 0;
        const method = data.method || 'sequential';
        
        let message = `Đã quét ${processed}/${unprocessedEmails.length} email`;
        if (phishing > 0 || safe > 0) {
          message += `\n- Phishing: ${phishing}`;
          message += `\n- An toàn: ${safe}`;
        }
        if (method === 'parallel') {
          message += `\n(Chế độ song song với ${data.workers || 2} workers)`;
        }
        alert(message);
      } else {
        alert('Lỗi khi quét email');
      }
    } catch (error) {
      console.error('Error scanning emails:', error);
      alert('Lỗi khi quét email: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }, [unprocessedEmails, fetchEmails]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tác Vụ</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý email đã xử lý và chưa xử lý</p>
        </div>
        <button
          onClick={fetchEmails}
          disabled={loading || processing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Tổng số</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {processedEmails.length + unprocessedEmails.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Email</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Đã xử lý</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {processedEmails.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Email đã quét</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Chưa xử lý</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {unprocessedEmails.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Email cần quét</div>
        </div>
      </div>

      {/* Filter and Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Lọc:</span>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'unprocessed', label: 'Chưa xử lý' },
                { id: 'processed', label: 'Đã xử lý' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {unprocessedEmails.length > 0 && (
            <button
              onClick={handleScanAll}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {processing ? 'Đang quét...' : `Quét gấp ${unprocessedEmails.length} email`}
            </button>
          )}
        </div>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Không có email nào</p>
            <p className="text-sm text-gray-500 mt-2">
              {filter === 'unprocessed' 
                ? 'Tất cả email đã được xử lý'
                : filter === 'processed'
                ? 'Chưa có email nào được xử lý'
                : 'Không có email'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEmails.map((email, idx) => {
              const isProcessed = email.is_processed || email.status === 'processed' || email.status === 'verified' || email.status === 'blocked';
              const isPhishing = email.is_phishing || email.status === 'blocked';

              return (
                <div
                  key={email.id || idx}
                  className="p-5 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Status Icon */}
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        isProcessed
                          ? isPhishing
                            ? 'bg-red-100'
                            : 'bg-green-100'
                          : 'bg-orange-100'
                      }`}>
                        {isProcessed ? (
                          isPhishing ? (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )
                        ) : (
                          <Clock className="w-5 h-5 text-orange-600" />
                        )}
                      </div>

                      {/* Email Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                            isProcessed
                              ? isPhishing
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {isProcessed
                              ? isPhishing
                                ? 'Đã xử lý - Phishing'
                                : 'Đã xử lý - An toàn'
                              : 'Chưa xử lý'}
                          </span>
                          {isPhishing && (
                            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                              Rủi ro cao
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                          {email.subject || 'No subject'}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{email.sender || email.from || 'Unknown sender'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(email.date)}</span>
                          </div>
                          {email.url_count > 0 && (
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              <span>{email.url_count} URL</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isProcessed && (
                        <button
                          onClick={() => handleScanEmail(email)}
                          disabled={processing}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition disabled:opacity-50"
                          title="Quét email ngay"
                        >
                          <Zap className="w-4 h-4" />
                          Quét gấp
                        </button>
                      )}
                      {isProcessed && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm">
                          <Shield className="w-4 h-4" />
                          <span>Đã xử lý</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksTab;

