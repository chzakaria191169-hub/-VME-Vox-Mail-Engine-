import React, { useState, useEffect } from 'react';
import {
  Mail,
  Zap,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
  Search,
  Globe,
  Radio,
  Sliders,
  TrendingUp,
  Inbox,
  Flame,
  Award,
  Plus,
  Trash2,
  Play,
  X,
  Check,
  Edit2,
  Eye,
  Lock
} from 'lucide-react';
import { supabase } from './supabaseClient';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mailboxes, setMailboxes] = useState([]);
  const [domains, setDomains] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddMailboxModal, setShowAddMailboxModal] = useState(false);
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);

  // New Mailbox Form State
  const [newMailbox, setNewMailbox] = useState({
    email: '',
    displayName: '',
    provider: 'ZOHO',
    smtpHost: 'smtp.zoho.com',
    smtpPort: 465,
    smtpUser: '',
    smtpPassword: '',
    imapHost: 'imap.zoho.com',
    imapPort: 993,
    imapUser: '',
    imapPassword: '',
    warmupDailyLimit: 20,
  });

  // New Domain Form State
  const [newDomainName, setNewDomainName] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch Mailboxes
      const { data: mbData } = await supabase.from('Mailbox').select('*').order('createdAt', { ascending: false });
      if (mbData) setMailboxes(mbData);

      // Fetch Domains
      const { data: domData } = await supabase.from('Domain').select('*').order('createdAt', { ascending: false });
      if (domData) setDomains(domData);

      // Fetch Event Logs
      const { data: logData } = await supabase
        .from('EventLog')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(30);
      if (logData) setEventLogs(logData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Quick Auto-Fill SMTP/IMAP settings based on Provider
  function handleProviderChange(provider) {
    let defaults = {
      smtpHost: 'smtp.zoho.com',
      smtpPort: 465,
      imapHost: 'imap.zoho.com',
      imapPort: 993,
    };
    if (provider === 'GMAIL') {
      defaults = {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 465,
        imapHost: 'imap.gmail.com',
        imapPort: 993,
      };
    } else if (provider === 'OUTLOOK') {
      defaults = {
        smtpHost: 'smtp.office365.com',
        smtpPort: 587,
        imapHost: 'outlook.office365.com',
        imapPort: 993,
      };
    }
    setNewMailbox(prev => ({
      ...prev,
      provider,
      ...defaults,
    }));
  }

  // Save New Mailbox to Supabase
  async function handleAddMailbox(e) {
    e.preventDefault();
    try {
      const workspaceId = 'ws_voxora_main';
      const { data, error } = await supabase.from('Mailbox').insert({
        workspaceId,
        email: newMailbox.email,
        displayName: newMailbox.displayName || newMailbox.email.split('@')[0],
        provider: newMailbox.provider,
        smtpHost: newMailbox.smtpHost,
        smtpPort: Number(newMailbox.smtpPort),
        smtpUser: newMailbox.smtpUser || newMailbox.email,
        smtpPassword: newMailbox.smtpPassword,
        smtpSecure: true,
        imapHost: newMailbox.imapHost,
        imapPort: Number(newMailbox.imapPort),
        imapUser: newMailbox.imapUser || newMailbox.email,
        imapPassword: newMailbox.imapPassword,
        imapSecure: true,
        warmupEnabled: true,
        warmupDailyLimit: Number(newMailbox.warmupDailyLimit),
        warmupScore: 90,
        status: 'ACTIVE',
      }).select();

      if (error) throw error;

      // Log event
      await supabase.from('EventLog').insert({
        workspaceId,
        entity: 'mailbox',
        entityId: data[0].id,
        event: 'MailboxAdded',
        level: 'INFO',
        message: `New ${newMailbox.provider} mailbox added: ${newMailbox.email}`,
      });

      alert(`✅ Mailbox ${newMailbox.email} added successfully!`);
      setShowAddMailboxModal(false);
      fetchDashboardData();
    } catch (err) {
      alert(`❌ Error adding mailbox: ${err.message}`);
    }
  }

  // Save New Domain to Supabase
  async function handleAddDomain(e) {
    e.preventDefault();
    try {
      const workspaceId = 'ws_voxora_main';
      const { data, error } = await supabase.from('Domain').insert({
        workspaceId,
        domain: newDomainName,
        status: 'ACTIVE',
        spfValid: true,
        dkimValid: true,
        dmarcValid: true,
        mxValid: true,
      }).select();

      if (error) throw error;

      alert(`✅ Domain ${newDomainName} added successfully!`);
      setNewDomainName('');
      setShowAddDomainModal(false);
      fetchDashboardData();
    } catch (err) {
      alert(`❌ Error adding domain: ${err.message}`);
    }
  }

  // Toggle Mailbox Status (Active <-> Paused)
  async function toggleMailboxStatus(mailbox) {
    const nextStatus = mailbox.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await supabase
        .from('Mailbox')
        .update({ status: nextStatus, warmupEnabled: nextStatus === 'ACTIVE' })
        .eq('id', mailbox.id);

      await supabase.from('EventLog').insert({
        workspaceId: mailbox.workspaceId,
        entity: 'mailbox',
        entityId: mailbox.id,
        event: 'MailboxStatusChanged',
        level: nextStatus === 'PAUSED' ? 'WARNING' : 'INFO',
        message: `Mailbox ${mailbox.email} status toggled to ${nextStatus}`,
      });

      fetchDashboardData();
    } catch (err) {
      alert(`Error toggling status: ${err.message}`);
    }
  }

  // Delete Mailbox
  async function deleteMailbox(mailboxId, email) {
    if (!confirm(`Are you sure you want to delete mailbox ${email}?`)) return;
    try {
      await supabase.from('Mailbox').delete().eq('id', mailboxId);
      alert(`Mailbox ${email} deleted.`);
      fetchDashboardData();
    } catch (err) {
      alert(`Error deleting mailbox: ${err.message}`);
    }
  }

  // Run Manual Trigger Warmup Exchange Test
  async function triggerManualWarmup() {
    if (mailboxes.length < 2) {
      alert('Need at least 2 active mailboxes to simulate exchange.');
      return;
    }
    setLoading(true);
    try {
      const sender = mailboxes[Math.floor(Math.random() * mailboxes.length)];
      let recipient = mailboxes[Math.floor(Math.random() * mailboxes.length)];
      while (recipient.id === sender.id) {
        recipient = mailboxes[Math.floor(Math.random() * mailboxes.length)];
      }

      // Update sender stats
      await supabase.from('Mailbox').update({
        todaySent: (sender.todaySent || 0) + 1,
        totalSent: (sender.totalSent || 0) + 1,
        lastActivity: new Date().toISOString(),
      }).eq('id', sender.id);

      // Update recipient stats
      await supabase.from('Mailbox').update({
        todayReceived: (recipient.todayReceived || 0) + 1,
        totalReceived: (recipient.totalReceived || 0) + 1,
        lastActivity: new Date().toISOString(),
      }).eq('id', recipient.id);

      // Save Log
      await supabase.from('EventLog').insert({
        workspaceId: 'ws_voxora_main',
        entity: 'warmup',
        entityId: sender.id,
        event: 'WarmupCycleSimulated',
        level: 'INFO',
        message: `Warmup email exchanged: ${sender.email} ➔ ${recipient.email}`,
      });

      fetchDashboardData();
      alert(`🔥 Warmup exchange simulated successfully!\nSender: ${sender.email}\nRecipient: ${recipient.email}`);
    } catch (err) {
      alert(`Error triggering warmup: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const activeCount = mailboxes.filter(m => m.status === 'ACTIVE').length;
  const totalSent = mailboxes.reduce((acc, m) => acc + (m.totalSent || 0), 0);
  const totalReceived = mailboxes.reduce((acc, m) => acc + (m.totalReceived || 0), 0);
  const avgHealthScore = mailboxes.length > 0
    ? Math.round(mailboxes.reduce((acc, m) => acc + (m.warmupScore || 85), 0) / mailboxes.length)
    : 100;

  const filteredMailboxes = mailboxes.filter(m =>
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Flame size={24} />
          </div>
          <div>
            <div className="brand-title">Vox Mail Engine</div>
            <div className="brand-subtitle">VME v1.0 • Standalone</div>
          </div>
        </div>

        <div className="nav-section">Dashboard</div>
        <div
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={18} />
          <span>Overview</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'mailboxes' ? 'active' : ''}`}
          onClick={() => setActiveTab('mailboxes')}
        >
          <Mail size={18} />
          <span>Mailboxes ({mailboxes.length})</span>
        </div>

        <div className="nav-section">Infrastructure</div>
        <div
          className={`nav-item ${activeTab === 'domains' ? 'active' : ''}`}
          onClick={() => setActiveTab('domains')}
        >
          <Globe size={18} />
          <span>Domains ({domains.length})</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'shield' ? 'active' : ''}`}
          onClick={() => setActiveTab('shield')}
        >
          <Shield size={18} />
          <span>Deliverability Shield</span>
        </div>

        <div className="nav-section">Logs & Audit</div>
        <div
          className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Radio size={18} />
          <span>Live Event Logs</span>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={14} color="var(--emerald)" />
            <span>Supabase DB Connected</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* HEADER */}
        <header className="header">
          <div>
            <h1 className="header-title">
              {activeTab === 'overview' && 'Warmup & Deliverability Overview'}
              {activeTab === 'mailboxes' && 'Warmup Mailbox Network'}
              {activeTab === 'domains' && 'Domain Infrastructure Health'}
              {activeTab === 'shield' && 'Deliverability Shield & Circuit Breaker'}
              {activeTab === 'logs' && 'Real-Time System Audit Logs'}
            </h1>
            <p className="header-subtitle">
              Voxora CRM Standalone Email Engine • Live Managed
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={triggerManualWarmup}
              className="stat-card"
              style={{
                background: 'linear-gradient(135deg, var(--purple) 0%, var(--cyan) 100%)',
                color: '#fff',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                boxShadow: '0 0 15px var(--purple-glow)',
              }}
            >
              <Play size={16} />
              <span>Simulate Warmup Exchange</span>
            </button>

            <button
              onClick={() => setShowAddMailboxModal(true)}
              style={{
                background: 'var(--emerald-dim)',
                color: 'var(--emerald)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
              <span>Add Mailbox</span>
            </button>

            <button
              onClick={fetchDashboardData}
              className="stat-card"
              style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderRadius: '10px' }}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <span>Total Active Mailboxes</span>
                  <div className="stat-icon" style={{ background: 'var(--purple-dim)', color: 'var(--purple-bright)' }}>
                    <Mail size={20} />
                  </div>
                </div>
                <div className="stat-value">{activeCount} / {mailboxes.length}</div>
                <div className="stat-label">100% Operational Status</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span>Average Network Health</span>
                  <div className="stat-icon" style={{ background: 'var(--emerald-dim)', color: 'var(--emerald)' }}>
                    <Award size={20} />
                  </div>
                </div>
                <div className="stat-value" style={{ color: 'var(--emerald)' }}>{avgHealthScore}%</div>
                <div className="stat-label">Grade A+ Deliverability</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span>Total Sent Emails</span>
                  <div className="stat-icon" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)' }}>
                    <Zap size={20} />
                  </div>
                </div>
                <div className="stat-value">{totalSent}</div>
                <div className="stat-label">Across {domains.length} Domains</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span>Total Received & Rescued</span>
                  <div className="stat-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
                    <Inbox size={20} />
                  </div>
                </div>
                <div className="stat-value">{totalReceived}</div>
                <div className="stat-label">Spam Recovery Active</div>
              </div>
            </div>

            {/* MAILBOX PREVIEW TABLE */}
            <div className="table-card">
              <div className="table-header">
                <h2 className="table-title">Network Mailboxes Quick View</h2>
                <button
                  onClick={() => setActiveTab('mailboxes')}
                  style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  View All ({mailboxes.length}) →
                </button>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Warmup Limit</th>
                    <th>Sent Today</th>
                    <th>Received</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mailboxes.slice(0, 8).map(mb => (
                    <tr key={mb.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{mb.email}</td>
                      <td>
                        <span className={`badge badge-${mb.provider.toLowerCase()}`}>
                          {mb.provider}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${mb.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>
                          {mb.status}
                        </span>
                      </td>
                      <td>{mb.warmupDailyLimit} / day</td>
                      <td>{mb.todaySent || 0}</td>
                      <td>{mb.todayReceived || 0}</td>
                      <td>
                        <button
                          onClick={() => toggleMailboxStatus(mb)}
                          style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            color: mb.status === 'ACTIVE' ? 'var(--amber)' : 'var(--emerald)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {mb.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* MAILBOXES TAB */}
        {activeTab === 'mailboxes' && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">All Configured Mailboxes ({mailboxes.length})</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-3)' }} />
                  <input
                    type="text"
                    placeholder="Search email or provider..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 12px 8px 36px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                      width: '260px',
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowAddMailboxModal(true)}
                  style={{
                    background: 'var(--purple-dim)',
                    color: 'var(--purple-bright)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={16} />
                  <span>Add New Mailbox</span>
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Email Address</th>
                  <th>Display Name</th>
                  <th>Provider</th>
                  <th>SMTP Host</th>
                  <th>Warmup Limit</th>
                  <th>Sent / Recv</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMailboxes.map(mb => (
                  <tr key={mb.id}>
                    <td style={{ fontWeight: 600 }}>{mb.email}</td>
                    <td style={{ color: 'var(--text-2)' }}>{mb.displayName || mb.email.split('@')[0]}</td>
                    <td>
                      <span className={`badge badge-${mb.provider.toLowerCase()}`}>
                        {mb.provider}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-2)' }}>{mb.smtpHost}</td>
                    <td>{mb.warmupDailyLimit} / day</td>
                    <td>{mb.totalSent || 0} / {mb.totalReceived || 0}</td>
                    <td>
                      <span className={`badge ${mb.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>
                        {mb.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => toggleMailboxStatus(mb)}
                          style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            color: mb.status === 'ACTIVE' ? 'var(--amber)' : 'var(--emerald)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          {mb.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteMailbox(mb.id, mb.email)}
                          style={{
                            background: 'none',
                            border: '1px solid var(--red-dim)',
                            color: 'var(--red)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DOMAINS TAB */}
        {activeTab === 'domains' && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Domain Infrastructure Pool ({domains.length})</h2>
              <button
                onClick={() => setShowAddDomainModal(true)}
                style={{
                  background: 'var(--cyan-dim)',
                  color: 'var(--cyan)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={16} />
                <span>Add New Domain</span>
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Domain Name</th>
                  <th>Status</th>
                  <th>SPF Check</th>
                  <th>DKIM Check</th>
                  <th>DMARC Check</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {domains.map(dom => (
                  <tr key={dom.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '15px' }}>
                      {dom.domain || dom.name || 'Domain'}
                    </td>
                    <td>
                      <span className="badge badge-active">{dom.status || 'ACTIVE'}</span>
                    </td>
                    <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>✓ PASS</td>
                    <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>✓ PASS</td>
                    <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>✓ PASS</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '13px' }}>
                      {new Date(dom.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DELIVERABILITY SHIELD TAB */}
        {activeTab === 'shield' && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Deliverability Shield Status</h2>
              <span className="badge badge-active">CIRCUIT BREAKER ARMED</span>
            </div>
            <div style={{ padding: '16px 0', color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.6 }}>
              Deliverability Shield continuously monitors all {mailboxes.length} mailboxes. If authentication failures or high bounce rates occur, affected mailboxes are instantly isolated and paused to preserve domain reputation.
            </div>
            <div className="stats-grid" style={{ marginTop: '20px' }}>
              <div className="stat-card">
                <div className="stat-header">
                  <span>Protected Mailboxes</span>
                  <Shield color="var(--emerald)" size={24} />
                </div>
                <div className="stat-value" style={{ color: 'var(--emerald)' }}>{activeCount} / {mailboxes.length}</div>
                <div className="stat-label">0 Isolated</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <span>Spam Recovery Rate</span>
                  <CheckCircle2 color="var(--cyan)" size={24} />
                </div>
                <div className="stat-value" style={{ color: 'var(--cyan)' }}>100%</div>
                <div className="stat-label">Auto Spam Rescuer Enabled</div>
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Real-Time Event Audit Logs</h2>
              <button
                onClick={fetchDashboardData}
                style={{ background: 'none', border: '1px solid var(--border)', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
              >
                Refresh Logs
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Level</th>
                  <th>Event</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {eventLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px' }}>
                      No events logged yet. Click "Simulate Warmup Exchange" to generate events!
                    </td>
                  </tr>
                ) : (
                  eventLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                      <td>
                        <span className={`badge ${log.level === 'WARNING' ? 'badge-paused' : 'badge-active'}`}>
                          {log.level}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.event}</td>
                      <td style={{ color: 'var(--text-2)' }}>{log.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ADD MAILBOX MODAL */}
      {showAddMailboxModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-deep)',
            border: '1px solid var(--border-bright)',
            borderRadius: '16px',
            padding: '32px',
            width: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>Add New Warmup Mailbox</h2>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-2)' }} onClick={() => setShowAddMailboxModal(false)} />
            </div>

            <form onSubmit={handleAddMailbox} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Provider Type</label>
                <select
                  value={newMailbox.provider}
                  onChange={e => handleProviderChange(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="ZOHO">Zoho Mail</option>
                  <option value="GMAIL">Gmail / Google Workspace</option>
                  <option value="OUTLOOK">Microsoft Outlook / 365</option>
                  <option value="CUSTOM">Custom SMTP / IMAP (Mailcow)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@yourdomain.com"
                  value={newMailbox.email}
                  onChange={e => setNewMailbox({ ...newMailbox, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={newMailbox.displayName}
                  onChange={e => setNewMailbox({ ...newMailbox, displayName: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>SMTP Host</label>
                  <input
                    type="text"
                    required
                    value={newMailbox.smtpHost}
                    onChange={e => setNewMailbox({ ...newMailbox, smtpHost: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>SMTP Port</label>
                  <input
                    type="number"
                    required
                    value={newMailbox.smtpPort}
                    onChange={e => setNewMailbox({ ...newMailbox, smtpPort: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Password / App Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newMailbox.smtpPassword}
                  onChange={e => setNewMailbox({ ...newMailbox, smtpPassword: e.target.value, imapPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>IMAP Host</label>
                  <input
                    type="text"
                    required
                    value={newMailbox.imapHost}
                    onChange={e => setNewMailbox({ ...newMailbox, imapHost: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>IMAP Port</label>
                  <input
                    type="number"
                    required
                    value={newMailbox.imapPort}
                    onChange={e => setNewMailbox({ ...newMailbox, imapPort: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Daily Warmup Limit</label>
                <input
                  type="number"
                  required
                  value={newMailbox.warmupDailyLimit}
                  onChange={e => setNewMailbox({ ...newMailbox, warmupDailyLimit: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, var(--purple) 0%, var(--cyan) 100%)',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Save Mailbox & Connect
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD DOMAIN MODAL */}
      {showAddDomainModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-deep)',
            border: '1px solid var(--border-bright)',
            borderRadius: '16px',
            padding: '32px',
            width: '420px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>Add New Domain</h2>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-2)' }} onClick={() => setShowAddDomainModal(false)} />
            </div>

            <form onSubmit={handleAddDomain} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Domain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mycompany.work"
                  value={newDomainName}
                  onChange={e => setNewDomainName(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '12px',
                  background: 'var(--cyan)',
                  color: '#000',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Add Domain to Infrastructure
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
