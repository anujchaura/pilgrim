import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Upload, RefreshCw, LayoutDashboard, List, Activity, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import './index.css';

// Auto-detect: local pe localhost, deployed pe Render
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : 'https://pilgrim-1.onrender.com/api';

const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d', '#0dcaf0', '#20c997'];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState({ total_credits: 0, total_debits: 0, unmatched_amount: 0 });
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bankFile, setBankFile] = useState(null);
  const [ledgerFile, setLedgerFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sumRes = await axios.get(`${API_BASE}/summary/`);
      setSummary(sumRes.data);
      
      const catRes = await axios.get(`${API_BASE}/category-breakdown/`);
      setCategories(catRes.data);
      
      const transRes = await axios.get(`${API_BASE}/reconciliation/`);
      setTransactions(transRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleUpload = async () => {
    if (!bankFile && !ledgerFile) return alert('Please select files to upload');
    
    setLoading(true);
    const formData = new FormData();
    if (bankFile) formData.append('bank_statement', bankFile);
    if (ledgerFile) formData.append('internal_ledger', ledgerFile);

    try {
      await axios.post(`${API_BASE}/upload-csv/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Upload successful!');
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || 'Upload failed';
      alert(errMsg);
    }
    setLoading(false);
  };

  const handleReconcile = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/reconcile/`);
      await fetchData();
      alert('Reconciliation completed!');
      setActiveTab('dashboard');
    } catch (error) {
      console.error(error);
      alert('Reconciliation failed');
    }
    setLoading(false);
  };

  const downloadDashboard = async () => {
    const dashboardElement = document.querySelector('.main-content');
    if (!dashboardElement) return;
    
    setLoading(true);
    try {
      const canvas = await html2canvas(dashboardElement, {
        backgroundColor: '#f8f9fa',
        scale: 2
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Finance_Dashboard_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to download dashboard');
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (transactions.length === 0) return alert('No data to download');
    
    const headers = ['Date', 'Amount', 'Category', 'Source', 'Status'];
    const rows = transactions.map(txn => [
      txn.date,
      txn.amount,
      txn.category || 'Uncategorized',
      txn.source,
      txn.reconciliation_status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">
          Ledger Dashboard
        </div>
        
        <nav>
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Ledger & Recon
          </button>
          <button 
            className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Data Import
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>{activeTab === 'dashboard' ? 'Finance Overview' : activeTab === 'transactions' ? 'Reconciliation Ledger' : 'Import Data'}</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {activeTab === 'dashboard' && (
              <button className="btn btn-secondary" onClick={downloadDashboard} disabled={loading}>
                Download PDF
              </button>
            )}
            {activeTab === 'transactions' && (
              <button className="btn btn-secondary" onClick={downloadCSV} disabled={loading}>
                Download CSV
              </button>
            )}
            <button className="btn" onClick={handleReconcile} disabled={loading}>
              Run Reconciliation
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card success">
                <h3>Total Credits</h3>
                <p className="value">₹{Number(summary.total_credits).toLocaleString()}</p>
              </div>
              <div className="stat-card danger">
                <h3>Total Debits</h3>
                <p className="value">₹{Number(summary.total_debits).toLocaleString()}</p>
              </div>
              <div className="stat-card accent">
                <h3>Unmatched Amount</h3>
                <p className="value">₹{Number(summary.unmatched_amount).toLocaleString()}</p>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Expenses by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="total"
                      nameKey="category"
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-card">
                <h3>Category Breakdown (Bar)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categories}>
                    <XAxis dataKey="category" stroke="#6c757d" />
                    <YAxis stroke="#6c757d" />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} formatter={(value) => `₹${value}`} />
                    <Bar dataKey="total" fill="#0d6efd" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.date}</td>
                    <td>₹{Number(txn.amount).toLocaleString()}</td>
                    <td>{txn.category || '-'}</td>
                    <td><span style={{textTransform: 'capitalize'}}>{txn.source}</span></td>
                    <td>
                      <span className={`status-badge ${txn.reconciliation_status}`}>
                        {txn.reconciliation_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', color: '#94a3b8'}}>No transactions found. Run reconciliation.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="upload-section">
            <h2>Data Import</h2>
            <p style={{color: 'var(--text-secondary)'}}>Select your bank statement and internal ledger CSV files below.</p>
            
            <div className="upload-controls">
              <div className="file-input">
                <label>Bank Statement CSV</label>
                <input type="file" accept=".csv" onChange={(e) => setBankFile(e.target.files[0])} />
              </div>
              <div className="file-input">
                <label>Internal Ledger CSV</label>
                <input type="file" accept=".csv" onChange={(e) => setLedgerFile(e.target.files[0])} />
              </div>
            </div>
            
            <button className="btn" style={{marginTop: '2rem', display: 'inline-flex'}} onClick={handleUpload} disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
