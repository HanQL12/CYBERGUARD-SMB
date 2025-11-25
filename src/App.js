import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DashboardLayout from './components/DashboardLayout';
import OverviewTab from './components/OverviewTab';
import OverviewWidgets from './components/OverviewWidgets';
import ScannerTab from './components/ScannerTab';
import MFATab from './components/MFATab';
import EmailProtectionTab from './components/EmailProtectionTab';
import PolicyManagementTab from './components/PolicyManagementTab';
import ReportsTab from './components/ReportsTab';
import SettingsTab from './components/SettingsTab';
import TasksTab from './components/TasksTab';
import { apiCall, apiCallWithRetry } from './config/api';
import { REFRESH_INTERVALS, WORKFLOW_STATUS } from './constants';


function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [scanUrl, setScanUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [emailFilter, setEmailFilter] = useState('all');
  
  // Real data from backend
  const [realStats, setRealStats] = useState({
    total_emails_scanned: 0,
    phishing_detected: 0,
    safe_emails: 0,
    workflow_status: WORKFLOW_STATUS.LOADING,
    last_updated: null,
    phishing_rate: '0%'
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [realEmails, setRealEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  // Unified function to fetch both statistics and emails in one call
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingStats(true);
      setLoadingEmails(true);
      
      const result = await apiCallWithRetry('/dashboard-data', {
        method: 'GET'
      }, 2); // Retry 2 times
      
      if (result.success && result.data) {
        const data = result.data;
        
        // Extract statistics and emails from unified response
        if (data.statistics) {
          setRealStats({
            total_emails_scanned: data.statistics.total_emails_scanned ?? 0,
            phishing_detected: data.statistics.phishing_detected ?? 0,
            safe_emails: data.statistics.safe_emails ?? 0,
            workflow_status: data.statistics.workflow_status || 'active',
            last_updated: data.statistics.last_updated || new Date().toISOString(),
            phishing_rate: data.statistics.phishing_rate || '0%'
          });
        }
        
        if (data.emails?.emails && Array.isArray(data.emails.emails)) {
          setRealEmails(data.emails.emails);
        } else if (Array.isArray(data.emails)) {
          setRealEmails(data.emails);
        } else {
          setRealEmails([]);
        }
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setRealStats(prev => ({
        ...prev,
        workflow_status: WORKFLOW_STATUS.ERROR
      }));
      setRealEmails([]);
    } finally {
      setLoadingStats(false);
      setLoadingEmails(false);
    }
  }, []);

  // Fetch unified dashboard data on component mount and set up auto-refresh
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, REFRESH_INTERVALS.DASHBOARD);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleScan = useCallback(async () => {
    const url = scanUrl.trim();
    if (!url) return;
    
    setScanning(true);
    setScanResult(null);
    
    try {
      const result = await apiCallWithRetry('/scan-url', {
        method: 'POST',
        body: JSON.stringify({ url })
      }, 2);
      
      if (result.success && result.data) {
        const data = result.data;
        setScanResult({
          url: data.url || url,
          riskLevel: data.risk_level || (data.is_malicious ? 'HIGH' : 'LOW'),
          threatType: data.threat_type || (data.is_malicious ? 'Phishing' : 'Safe'),
          confidence: data.confidence || (data.is_malicious ? 85 : 5),
          vendors: data.vendors || '0/90',
          categories: data.categories || (data.is_malicious ? ['phishing'] : ['safe']),
          timestamp: data.timestamp || new Date().toISOString(),
          // VirusTotal specific fields
          malicious: data.malicious || 0,
          suspicious: data.suspicious || 0,
          harmless: data.harmless || 0,
          total_engines: data.total_engines || 0,
          source: data.source || 'VirusTotal',
          scan_id: data.scan_id,
          error: data.error
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error scanning URL:', error);
      setScanResult({
        url,
        riskLevel: 'UNKNOWN',
        threatType: 'Error',
        confidence: 0,
        vendors: '0/90',
        categories: ['error'],
        timestamp: new Date().toLocaleString(),
        error: error.message || 'Failed to scan URL'
      });
    } finally {
      setScanning(false);
    }
  }, [scanUrl]);

  const displayStats = useMemo(() => {
    const useRealData = realStats.workflow_status === WORKFLOW_STATUS.ACTIVE;
    
    // Always use real data if available, even if workflow_status is not 'active'
    const totalFromStats = realStats.total_emails_scanned ?? 0;
    const phishingFromStats = realStats.phishing_detected ?? 0;
    const safeFromStats = realStats.safe_emails ?? 0;
    
    // Use email list length if stats are 0 but we have emails
    const actualTotal = realEmails.length > 0 ? realEmails.length : totalFromStats;
    const actualPhishing = realEmails.filter(e => e.is_phishing).length || phishingFromStats;
    const actualSafe = realEmails.filter(e => !e.is_phishing).length || safeFromStats;
    
    if (useRealData || totalFromStats > 0 || realEmails.length > 0) {
      return {
        totalEmails: actualTotal,
        threatsDetected: actualPhishing,
        blocked: actualPhishing,
        safeEmails: actualSafe,
        phishingRate: actualTotal > 0 ? `${((actualPhishing / actualTotal) * 100).toFixed(1)}%` : '0%',
        actualTotal: actualTotal,
        actualPhishing: actualPhishing,
        actualSafe: actualSafe
      };
    }
    
    // Fallback mock data only when not loading and no real data
    if (loadingStats) {
      return {
        totalEmails: undefined,
        threatsDetected: undefined,
        blocked: undefined,
        safeEmails: undefined,
        phishingRate: undefined,
        actualTotal: 0,
        actualPhishing: 0,
        actualSafe: 0
      };
    }
    
    return {
      totalEmails: 284,
      threatsDetected: 37,
      blocked: 37,
      safeEmails: 247,
      phishingRate: '13%',
      actualTotal: actualTotal,
      actualPhishing: actualPhishing,
      actualSafe: actualSafe
    };
  }, [realStats, realEmails, loadingStats]);


  const filteredEmails = useMemo(() => {
    if (realEmails.length === 0) {
      return [];
    }

    if (emailFilter === 'all') return realEmails;
    if (emailFilter === 'phishing') return realEmails.filter(e => e.is_phishing);
    if (emailFilter === 'safe') return realEmails.filter(e => !e.is_phishing);
    return realEmails;
  }, [realEmails, emailFilter]);

  const [closedWidgets, setClosedWidgets] = useState(new Set());

  const handleCloseWidget = (widgetId) => {
    setClosedWidgets(prev => new Set([...prev, widgetId]));
  };

  const handleAddWidget = () => {
    // TODO: Implement add widget functionality
    console.log('Add widget clicked');
  };

  const handleRestoreLayout = () => {
    setClosedWidgets(new Set());
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'overview' ? (
        <div className="flex-1 ml-64 bg-gray-50 min-h-screen p-6">
          <OverviewTab
            realStats={realStats}
            loadingStats={loadingStats}
            displayStats={displayStats}
            onRefresh={fetchDashboardData}
            filteredEmails={filteredEmails}
          />
        </div>
      ) : (
        <div className="flex-1 ml-64 bg-gray-50 min-h-screen p-6">
        {activeTab === 'scanner' && (
            <ScannerTab
              scanUrl={scanUrl}
              setScanUrl={setScanUrl}
              scanning={scanning}
              scanResult={scanResult}
              onScan={handleScan}
              displayStats={displayStats}
            />
        )}

        {activeTab === 'mfa' && (
            <MFATab />
        )}

        {activeTab === 'emails' && (
            <EmailProtectionTab
              emailFilter={emailFilter}
              setEmailFilter={setEmailFilter}
              loadingEmails={loadingEmails}
              filteredEmails={filteredEmails}
              displayStats={displayStats}
              onRefresh={fetchDashboardData}
            />
          )}

          {activeTab === 'policies' && (
            <PolicyManagementTab />
          )}

          {activeTab === 'reports' && (
            <ReportsTab displayStats={displayStats} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}

          {activeTab === 'tasks' && (
            <TasksTab />
          )}
        </div>
      )}
    </div>
  );
}

export default App;