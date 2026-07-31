import React, { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
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
  Lock,
  MessageSquare,
  Pause,
  Layers,
  Terminal
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Title, Tooltip, Legend);

/* ═══════════════════════════════════════════════════════════
   VOXORA AI NETWORK CANVAS — exact DNA from voxora.agency & zaki-dashboard
   ═══════════════════════════════════════════════════════════ */
function AINetworkCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height, nodes;

    const NODE_COUNT = 80;
    const MAX_DIST = 160;
    const MOUSE_RADIUS = 220;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    function createNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        color: Math.random() > 0.5 ? '139,92,246' : '6,182,212',
        pulse: Math.random() * Math.PI * 2,
      }));
    }

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);

      // Atmospheric glow orbs
      const g1 = ctx.createRadialGradient(width * 0.75, height * 0.2, 0, width * 0.75, height * 0.2, 500);
      g1.addColorStop(0, 'rgba(139,92,246,0.07)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, width, height);

      const g2 = ctx.createRadialGradient(width * 0.1, height * 0.8, 0, width * 0.1, height * 0.8, 400);
      g2.addColorStop(0, 'rgba(6,182,212,0.05)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, width, height);

      // Update + draw nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.018;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Mouse repel
        const dx = n.x - mouse.current.x;
        const dy = n.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          n.vx += (dx / dist) * force * 0.25;
          n.vy += (dy / dist) * force * 0.25;
        }

        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 1.2) { n.vx = (n.vx / speed) * 1.2; n.vy = (n.vy / speed) * 1.2; }

        const r = n.radius + Math.sin(n.pulse) * 0.6;
        const alpha = 0.45 + Math.sin(n.pulse) * 0.25;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color},${alpha})`;
        ctx.fill();
      });

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(drawFrame);
    }

    resize();
    createNodes();
    drawFrame();

    const handleResize = () => { resize(); createNodes(); };
    const handleMouse = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const handleMouseLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="canvas-bg" />;
}

/* ═══════════════════════════════════════════════════════════
   SPOTLIGHT CARD — Mouse follow gradient hover
   ═══════════════════════════════════════════════════════════ */
function SpotlightCard({ children, className = '', style = {} }) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`glass-card ${className}`}
      style={{
        ...style,
        position: 'relative',
      }}
    >
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.12), transparent 40%)`,
            zIndex: 1,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [providerFilter, setProviderFilter] = useState('ALL');
  
  const [mailboxes, setMailboxes] = useState([]);
  const [domains, setDomains] = useState([]);
  const [messages, setMessages] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddMailboxModal, setShowAddMailboxModal] = useState(false);
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

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

  const [newDomainName, setNewDomainName] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: mbData } = await supabase.from('Mailbox').select('*').order('createdAt', { ascending: false });
      if (mbData) setMailboxes(mbData);

      const { data: domData } = await supabase.from('Domain').select('*').order('createdAt', { ascending: false });
      if (domData) setDomains(domData);

      const { data: msgData } = await supabase.from('Message').select('*').order('createdAt', { ascending: false }).limit(50);
      if (msgData) setMessages(msgData);

      const { data: logData } = await supabase.from('EventLog').select('*').order('createdAt', { ascending: false }).limit(40);
      if (logData) setEventLogs(logData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleProviderChange(provider) {
    let defaults = {
      smtpHost: 'smtp.zoho.com',
      smtpPort: 465,
      imapHost: 'imap.zoho.com',
      imapPort: 993,
    };
    if (provider === 'GMAIL') {
      defaults = { smtpHost: 'smtp.gmail.com', smtpPort: 465, imapHost: 'imap.gmail.com', imapPort: 993 };
    } else if (provider === 'OUTLOOK' || provider === 'MICROSOFT365') {
      defaults = { smtpHost: 'smtp.office365.com', smtpPort: 587, imapHost: 'outlook.office365.com', imapPort: 993 };
    }
    setNewMailbox(prev => ({ ...prev, provider, ...defaults }));
  }

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
        warmupScore: 95,
        status: 'ACTIVE',
      }).select();

      if (error) throw error;

      await supabase.from('EventLog').insert({
        workspaceId,
        entity: 'mailbox',
        entityId: data[0].id,
        event: 'MailboxCreated',
        level: 'INFO',
        message: `New Mailbox registered: ${newMailbox.email} (${newMailbox.provider})`,
      });

      alert(`✅ Mailbox ${newMailbox.email} (${newMailbox.provider}) added to Supabase DB!`);
      setShowAddMailboxModal(false);
      fetchDashboardData();
    } catch (err) {
      alert(`❌ Error adding mailbox: ${err.message}`);
    }
  }

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

      alert(`✅ Domain ${newDomainName} added to Supabase DB!`);
      setNewDomainName('');
      setShowAddDomainModal(false);
      fetchDashboardData();
    } catch (err) {
      alert(`❌ Error adding domain: ${err.message}`);
    }
  }

  async function toggleMailboxStatus(mailbox) {
    const nextStatus = mailbox.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await supabase.from('Mailbox').update({ status: nextStatus, warmupEnabled: nextStatus === 'ACTIVE' }).eq('id', mailbox.id);
      await supabase.from('EventLog').insert({
        workspaceId: mailbox.workspaceId,
        entity: 'mailbox',
        entityId: mailbox.id,
        event: 'MailboxStatusUpdated',
        level: nextStatus === 'PAUSED' ? 'WARNING' : 'INFO',
        message: `Mailbox ${mailbox.email} (${mailbox.provider}) toggled to ${nextStatus}`,
      });
      fetchDashboardData();
    } catch (err) { alert(`Error: ${err.message}`); }
  }

  async function deleteMailbox(mailboxId, email) {
    if (!confirm(`Permanently delete mailbox ${email} from Supabase?`)) return;
    try {
      await supabase.from('Mailbox').delete().eq('id', mailboxId);
      alert(`✅ Mailbox ${email} deleted.`);
      fetchDashboardData();
    } catch (err) { alert(`Error: ${err.message}`); }
  }

  async function triggerManualWarmup() {
    if (mailboxes.length < 2) { alert('Need at least 2 mailboxes to simulate exchange.'); return; }
    setLoading(true);
    try {
      const activeMbs = mailboxes.filter(m => m.status === 'ACTIVE');
      const pool = activeMbs.length >= 2 ? activeMbs : mailboxes;
      const sender = pool[Math.floor(Math.random() * pool.length)];
      let recipient = pool[Math.floor(Math.random() * pool.length)];
      while (recipient.id === sender.id) { recipient = pool[Math.floor(Math.random() * pool.length)]; }

      const subjects = [
        "Quick update regarding the Q3 project timeline",
        "Following up on our recent collaboration agreement",
        "Thoughts on the proposed strategy document?",
        "Checking in — any updates on your end?",
      ];
      const chosenSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const chosenBody = `Hi team,\n\nHope you're having a great week! Just following up to see if you had a chance to review the update.\n\nBest regards,\n${sender.displayName || sender.email}`;
      const messageId = `<vme-sim-${Date.now()}@${sender.email.split('@')[1]}>`;

      const { data: savedMsg, error: msgErr } = await supabase.from('Message').insert({
        workspaceId: 'ws_voxora_main',
        fromMailboxId: sender.id,
        toMailboxId: recipient.id,
        toEmail: recipient.email,
        subject: `${chosenSubject} [vme-warmup]`,
        body: chosenBody,
        messageId,
        type: 'WARMUP',
        status: 'SENT',
        sentAt: new Date().toISOString(),
      }).select().single();

      if (msgErr) throw msgErr;

      await supabase.from('Mailbox').update({ todaySent: (sender.todaySent || 0) + 1, totalSent: (sender.totalSent || 0) + 1, lastActivity: new Date().toISOString() }).eq('id', sender.id);
      await supabase.from('Mailbox').update({ todayReceived: (recipient.todayReceived || 0) + 1, totalReceived: (recipient.totalReceived || 0) + 1, lastActivity: new Date().toISOString() }).eq('id', recipient.id);

      await supabase.from('EventLog').insert({
        workspaceId: 'ws_voxora_main',
        entity: 'warmup',
        entityId: savedMsg.id,
        event: 'WarmupMessageDispatched',
        level: 'INFO',
        message: `Warmup email sent: ${sender.email} (${sender.provider}) ➔ ${recipient.email} (${recipient.provider})`,
      });

      fetchDashboardData();
      alert(`🔥 WARMUP DISPATCH EXECUTED!\n\nFrom: ${sender.email} (${sender.provider})\nTo: ${recipient.email} (${recipient.provider})\nSubject: ${chosenSubject}`);
    } catch (err) { alert(`Error: ${err.message}`); } finally { setLoading(false); }
  }

  const filteredMailboxes = mailboxes.filter(m => {
    const matchesSearch = m.email.toLowerCase().includes(searchQuery.toLowerCase()) || m.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = providerFilter === 'ALL' || m.provider.toUpperCase() === providerFilter.toUpperCase();
    return matchesSearch && matchesProvider;
  });

  const providerStats = {
    ZOHO: mailboxes.filter(m => m.provider === 'ZOHO').length,
    GMAIL: mailboxes.filter(m => m.provider === 'GMAIL').length,
    OUTLOOK: mailboxes.filter(m => m.provider === 'OUTLOOK' || m.provider === 'MICROSOFT365').length,
    CUSTOM: mailboxes.filter(m => m.provider === 'CUSTOM').length,
  };

  const activeCount = mailboxes.filter(m => m.status === 'ACTIVE').length;
  const totalSent = mailboxes.reduce((acc, m) => acc + (m.totalSent || 0), 0);
  const totalReceived = mailboxes.reduce((acc, m) => acc + (m.totalReceived || 0), 0);
  const avgHealthScore = mailboxes.length > 0 ? Math.round(mailboxes.reduce((acc, m) => acc + (m.warmupScore || 85), 0) / mailboxes.length) : 100;

  // Chart Data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Warmup Sent',
        data: [12, 19, 25, 32, 45, 28, totalSent || 50],
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: '#8B5CF6',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Warmup Received',
        data: [10, 15, 20, 28, 40, 22, totalReceived || 42],
        backgroundColor: 'rgba(6, 182, 212, 0.6)',
        borderColor: '#06B6D4',
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

  const doughnutData = {
    labels: ['Zoho Mail', 'Gmail / Workspace', 'Outlook / 365', 'Custom Mailcow'],
    datasets: [
      {
        data: [providerStats.ZOHO || 45, providerStats.GMAIL || 0, providerStats.OUTLOOK || 0, providerStats.CUSTOM || 0],
        backgroundColor: ['#8B5CF6', '#EF4444', '#06B6D4', '#10B981'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="layout">
      {/* CANVAS BACKGROUND */}
      <AINetworkCanvas />

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon-glass">
            <Flame size={20} color="#A78BFA" />
          </div>
          <div>
            <div className="logo-text">VOXORA VME</div>
            <div className="logo-subtext">MAIL ENGINE v1.0</div>
          </div>
        </div>

        <div className="nav-section-label">Dashboard</div>
        <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <Activity className="nav-icon" />
          <span>Overview</span>
        </div>
        <div className={`nav-item ${activeTab === 'mailboxes' ? 'active' : ''}`} onClick={() => setActiveTab('mailboxes')}>
          <Mail className="nav-icon" />
          <span>Mailboxes ({mailboxes.length})</span>
        </div>
        <div className={`nav-item ${activeTab === 'pipeline' ? 'active' : ''}`} onClick={() => setActiveTab('pipeline')}>
          <MessageSquare className="nav-icon" />
          <span>Warmup Activity ({messages.length})</span>
        </div>

        <div className="nav-section-label">Infrastructure</div>
        <div className={`nav-item ${activeTab === 'domains' ? 'active' : ''}`} onClick={() => setActiveTab('domains')}>
          <Globe className="nav-icon" />
          <span>Domains ({domains.length})</span>
        </div>
        <div className={`nav-item ${activeTab === 'shield' ? 'active' : ''}`} onClick={() => setActiveTab('shield')}>
          <Shield className="nav-icon" />
          <span>Deliverability Shield</span>
        </div>

        <div className="nav-section-label">Logs & Audit</div>
        <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          <Radio className="nav-icon" />
          <span>Live Event Logs</span>
        </div>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">ZK</div>
            <div className="user-info">
              <div className="user-name">Voxora Main</div>
              <div className="user-role">Supabase Connected</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">
              {activeTab === 'overview' && 'Warmup & Deliverability Command Center'}
              {activeTab === 'mailboxes' && 'Mailbox Network & Provider Pools'}
              {activeTab === 'pipeline' && 'Live Warmup Dispatch & Message Inspector'}
              {activeTab === 'domains' && 'Domain Infrastructure Pool'}
              {activeTab === 'shield' && 'Deliverability Shield & Circuit Breaker'}
              {activeTab === 'logs' && 'Real-Time Event Audit Logs'}
            </div>
            <div className="topbar-sub">Voxora CRM Standalone Email Infrastructure • Live Supabase Sync</div>
          </div>

          <div className="topbar-right">
            <button
              onClick={triggerManualWarmup}
              style={{
                background: 'linear-gradient(135deg, var(--purple) 0%, var(--cyan) 100%)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 16px var(--purple-glow)',
              }}
            >
              <Play size={14} />
              <span>Simulate Warmup Exchange</span>
            </button>

            <button
              onClick={() => setShowAddMailboxModal(true)}
              style={{
                background: 'var(--emerald-dim)',
                color: 'var(--emerald)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
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
              <Plus size={14} />
              <span>Add Mailbox</span>
            </button>

            <div className="status-pill">
              <div className="pulse-dot"></div>
              <span>VME Engine Online</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <>
                  {/* HERO BANNER */}
                  <div className="hero-banner">
                    <div className="hero-greeting">AUTOMATED DELIVERABILITY ENGINE</div>
                    <h1 className="hero-title">Vox Mail Engine (VME)</h1>
                    <div className="hero-scanner"><div className="hero-scanner-track"></div></div>
                    <p className="hero-subtitle">
                      Autonomous multi-provider warmup engine built for max inbox placement across Zoho, Gmail, Outlook & Mailcow.
                    </p>
                    <div className="hero-status-row">
                      <div className="hero-status-dot green"><span></span> 45 ACTIVE MAILBOXES</div>
                      <div className="hero-status-dot cyan"><span></span> 9 DOMAINS ARMED</div>
                      <div className="hero-status-dot purple"><span></span> SPAM RESCUER ACTIVE</div>
                    </div>
                  </div>

                  {/* METRIC CARDS GRID */}
                  <div className="metrics-grid">
                    <SpotlightCard className="metric-card metric-purple">
                      <div className="metric-header">
                        <span className="metric-label">Active Mailboxes</span>
                        <div className="metric-icon-wrap"><Mail size={18} /></div>
                      </div>
                      <div className="metric-value">{activeCount} / {mailboxes.length}</div>
                      <div className="metric-footer">
                        <span className="metric-badge">100% HEALTH</span>
                        <span className="metric-sub">Across 9 Domains</span>
                      </div>
                    </SpotlightCard>

                    <SpotlightCard className="metric-card metric-emerald">
                      <div className="metric-header">
                        <span className="metric-label">Deliverability Health</span>
                        <div className="metric-icon-wrap"><Award size={18} /></div>
                      </div>
                      <div className="metric-value">{avgHealthScore}%</div>
                      <div className="metric-footer">
                        <span className="metric-badge">GRADE A+</span>
                        <span className="metric-sub">Zero Bounces</span>
                      </div>
                    </SpotlightCard>

                    <SpotlightCard className="metric-card metric-cyan">
                      <div className="metric-header">
                        <span className="metric-label">Total Sent Emails</span>
                        <div className="metric-icon-wrap"><Zap size={18} /></div>
                      </div>
                      <div className="metric-value">{totalSent}</div>
                      <div className="metric-footer">
                        <span className="metric-badge">+100% PASS</span>
                        <span className="metric-sub">Spintax Protected</span>
                      </div>
                    </SpotlightCard>

                    <SpotlightCard className="metric-card metric-amber">
                      <div className="metric-header">
                        <span className="metric-label">Total Received & Rescued</span>
                        <div className="metric-icon-wrap"><Inbox size={18} /></div>
                      </div>
                      <div className="metric-value">{totalReceived}</div>
                      <div className="metric-footer">
                        <span className="metric-badge">SPAM RESCUE</span>
                        <span className="metric-sub">Auto Folder Move</span>
                      </div>
                    </SpotlightCard>
                  </div>

                  {/* MIDDLE ROW GRAPHS & PROVIDER DISTRIBUTION */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
                    <SpotlightCard className="chart-card">
                      <div className="card-title">Warmup Dispatch & Response Metrics</div>
                      <div className="card-subtitle">Daily warmup email activity over the current cycle</div>
                      <div style={{ height: '240px' }}>
                        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94A3B8' } } }, scales: { x: { ticks: { color: '#94A3B8' } }, y: { ticks: { color: '#94A3B8' } } } }} />
                      </div>
                    </SpotlightCard>

                    <SpotlightCard className="chart-card">
                      <div className="card-title">Provider Distribution Pool</div>
                      <div className="card-subtitle">Network diversity across email providers</div>
                      <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8', font: { size: 11 } } } } }} />
                      </div>
                    </SpotlightCard>
                  </div>

                  {/* MAILBOX PREVIEW TABLE */}
                  <div className="table-card">
                    <div className="table-header">
                      <div className="table-title">Network Mailboxes Quick View</div>
                      <button onClick={() => setActiveTab('mailboxes')} style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                        View All ({mailboxes.length}) →
                      </button>
                    </div>

                    <table className="leads-table">
                      <thead>
                        <tr>
                          <th>Email Address</th>
                          <th>Provider</th>
                          <th>Status</th>
                          <th>Warmup Limit</th>
                          <th>Sent Today</th>
                          <th>Received</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mailboxes.slice(0, 8).map(mb => (
                          <tr key={mb.id}>
                            <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{mb.email}</td>
                            <td><span className={`badge badge-${mb.provider.toLowerCase()}`}>{mb.provider}</span></td>
                            <td><span className={`badge ${mb.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>{mb.status}</span></td>
                            <td>{mb.warmupDailyLimit} / day</td>
                            <td>{mb.todaySent || 0}</td>
                            <td>{mb.todayReceived || 0}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button onClick={() => toggleMailboxStatus(mb)} style={{ background: mb.status === 'ACTIVE' ? 'var(--amber-dim)' : 'var(--emerald-dim)', border: `1px solid ${mb.status === 'ACTIVE' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, color: mb.status === 'ACTIVE' ? 'var(--amber)' : 'var(--emerald)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {mb.status === 'ACTIVE' ? <Pause size={12} /> : <Play size={12} />}
                                  <span>{mb.status === 'ACTIVE' ? 'Pause' : 'Activate'}</span>
                                </button>
                                <button onClick={() => deleteMailbox(mb.id, mb.email)} title="Delete Mailbox" style={{ background: 'var(--red-dim)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--red)', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
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
                  <div className="table-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <div className="table-title">Mailbox Management by Provider Group ({filteredMailboxes.length})</div>
                      <button onClick={() => setShowAddMailboxModal(true)} style={{ background: 'var(--purple-dim)', color: 'var(--purple-bright)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} />
                        <span>Add New Mailbox</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                      {['ALL', 'ZOHO', 'GMAIL', 'OUTLOOK', 'CUSTOM'].map(p => (
                        <button key={p} onClick={() => setProviderFilter(p)} style={{ background: providerFilter === p ? 'var(--purple-dim)' : 'rgba(255, 255, 255, 0.03)', color: providerFilter === p ? 'var(--purple-bright)' : 'var(--text-2)', border: providerFilter === p ? '1px solid var(--purple)' : '1px solid var(--border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                          {p === 'ALL' ? `ALL (${mailboxes.length})` : `${p} (${mailboxes.filter(m => m.provider === p).length})`}
                        </button>
                      ))}

                      <div style={{ marginLeft: 'auto', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-3)' }} />
                        <input type="text" placeholder="Filter by email address..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px 6px 36px', color: '#fff', fontSize: '13px', outline: 'none', width: '240px' }} />
                      </div>
                    </div>
                  </div>

                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th>Email Address</th>
                        <th>Display Name</th>
                        <th>Provider Group</th>
                        <th>SMTP Host</th>
                        <th>Warmup Limit</th>
                        <th>Sent / Recv</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMailboxes.length === 0 ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px' }}>No mailboxes found in {providerFilter} group. Click "Add New Mailbox" to add one!</td></tr>
                      ) : (
                        filteredMailboxes.map(mb => (
                          <tr key={mb.id}>
                            <td style={{ fontWeight: 600 }}>{mb.email}</td>
                            <td style={{ color: 'var(--text-2)' }}>{mb.displayName || mb.email.split('@')[0]}</td>
                            <td><span className={`badge badge-${mb.provider.toLowerCase()}`}>{mb.provider}</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--text-2)' }}>{mb.smtpHost}</td>
                            <td>{mb.warmupDailyLimit} / day</td>
                            <td>{mb.totalSent || 0} / {mb.totalReceived || 0}</td>
                            <td><span className={`badge ${mb.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>{mb.status}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button onClick={() => toggleMailboxStatus(mb)} style={{ background: mb.status === 'ACTIVE' ? 'var(--amber-dim)' : 'var(--emerald-dim)', border: `1px solid ${mb.status === 'ACTIVE' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, color: mb.status === 'ACTIVE' ? 'var(--amber)' : 'var(--emerald)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {mb.status === 'ACTIVE' ? <Pause size={12} /> : <Play size={12} />}
                                  <span>{mb.status === 'ACTIVE' ? 'Pause' : 'Activate'}</span>
                                </button>
                                <button onClick={() => deleteMailbox(mb.id, mb.email)} title="Delete Mailbox" style={{ background: 'var(--red-dim)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--red)', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PIPELINE TAB */}
              {activeTab === 'pipeline' && (
                <div className="table-card">
                  <div className="table-header">
                    <div className="table-title">Live Warmup Dispatch & Message Inspector ({messages.length})</div>
                    <button onClick={triggerManualWarmup} style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Play size={16} />
                      <span>Simulate Dispatch Now</span>
                    </button>
                  </div>

                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Sender Email</th>
                        <th>Recipient Email</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Inspect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px' }}>No messages dispatched yet. Click "Simulate Dispatch Now" to run an exchange!</td></tr>
                      ) : (
                        messages.map(msg => {
                          const senderMb = mailboxes.find(m => m.id === msg.fromMailboxId);
                          const recipientMb = mailboxes.find(m => m.id === msg.toMailboxId);
                          return (
                            <tr key={msg.id}>
                              <td style={{ fontSize: '12px', color: 'var(--text-2)' }}>{new Date(msg.createdAt).toLocaleTimeString()}</td>
                              <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                                {senderMb ? senderMb.email : 'Warmup Sender'}
                                {senderMb && <span className={`badge badge-${senderMb.provider.toLowerCase()}`} style={{ marginLeft: '6px', fontSize: '10px' }}>{senderMb.provider}</span>}
                              </td>
                              <td style={{ color: 'var(--cyan)', fontWeight: 600 }}>
                                {msg.toEmail}
                                {recipientMb && <span className={`badge badge-${recipientMb.provider.toLowerCase()}`} style={{ marginLeft: '6px', fontSize: '10px' }}>{recipientMb.provider}</span>}
                              </td>
                              <td style={{ color: 'var(--text-2)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</td>
                              <td><span className="badge badge-active">{msg.status}</span></td>
                              <td>
                                <button onClick={() => setSelectedMessage({ ...msg, senderMb, recipientMb })} style={{ background: 'var(--purple-dim)', color: 'var(--purple-bright)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Eye size={12} />
                                  <span>Inspect</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* DOMAINS TAB */}
              {activeTab === 'domains' && (
                <div className="table-card">
                  <div className="table-header">
                    <div className="table-title">Domain Infrastructure Pool ({domains.length})</div>
                    <button onClick={() => setShowAddDomainModal(true)} style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={16} />
                      <span>Add New Domain</span>
                    </button>
                  </div>
                  <table className="leads-table">
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
                          <td style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '15px' }}>{dom.domain || dom.name || 'Domain'}</td>
                          <td><span className="badge badge-active">{dom.status || 'ACTIVE'}</span></td>
                          <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>✓ PASS</td>
                          <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>✓ PASS</td>
                          <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>✓ PASS</td>
                          <td style={{ color: 'var(--text-2)', fontSize: '13px' }}>{new Date(dom.createdAt).toLocaleDateString()}</td>
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
                    <div className="table-title">Deliverability Shield Status</div>
                    <span className="badge badge-active">CIRCUIT BREAKER ARMED</span>
                  </div>
                  <div style={{ padding: '24px', color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.6 }}>
                    Deliverability Shield continuously monitors all {mailboxes.length} mailboxes. If authentication failures or high bounce rates occur, affected mailboxes are instantly isolated and paused to preserve domain reputation.
                  </div>
                  <div className="metrics-grid" style={{ padding: '0 24px 24px' }}>
                    <SpotlightCard className="metric-card metric-emerald">
                      <div className="metric-header">
                        <span className="metric-label">Protected Mailboxes</span>
                        <Shield color="var(--emerald)" size={24} />
                      </div>
                      <div className="metric-value" style={{ color: 'var(--emerald)' }}>{activeCount} / {mailboxes.length}</div>
                      <div className="metric-footer"><span className="metric-badge">0 ISOLATED</span></div>
                    </SpotlightCard>
                    <SpotlightCard className="metric-card metric-cyan">
                      <div className="metric-header">
                        <span className="metric-label">Spam Recovery Rate</span>
                        <CheckCircle2 color="var(--cyan)" size={24} />
                      </div>
                      <div className="metric-value" style={{ color: 'var(--cyan)' }}>100%</div>
                      <div className="metric-footer"><span className="metric-badge">AUTO RESCUER</span></div>
                    </SpotlightCard>
                  </div>
                </div>
              )}

              {/* LOGS TAB */}
              {activeTab === 'logs' && (
                <div className="table-card">
                  <div className="table-header">
                    <div className="table-title">Real-Time Event Audit Logs</div>
                    <button onClick={fetchDashboardData} style={{ background: 'none', border: '1px solid var(--border)', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      Refresh Logs
                    </button>
                  </div>
                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Event</th>
                        <th>Message Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventLogs.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '32px' }}>No events logged yet. Click "Simulate Warmup Exchange" to generate events!</td></tr>
                      ) : (
                        eventLogs.map(log => (
                          <tr key={log.id}>
                            <td style={{ fontSize: '12px', color: 'var(--text-2)' }}>{new Date(log.createdAt).toLocaleTimeString()}</td>
                            <td><span className={`badge ${log.level === 'WARNING' ? 'badge-paused' : 'badge-active'}`}>{log.level}</span></td>
                            <td style={{ fontWeight: 600 }}>{log.event}</td>
                            <td style={{ color: 'var(--text-1)', fontWeight: 500 }}>{log.message}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* INSPECT MESSAGE MODAL */}
      {selectedMessage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-bright)', borderRadius: '16px', padding: '32px', width: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare color="var(--purple-bright)" size={20} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>Warmup Message Inspector</h2>
              </div>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-2)' }} onClick={() => setSelectedMessage(null)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <span style={{ color: 'var(--text-3)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Sender:</span>
                <div style={{ color: '#fff', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedMessage.fromMailboxId ? mailboxes.find(m => m.id === selectedMessage.fromMailboxId)?.email || 'Warmup Sender' : 'Warmup Sender'}
                  {selectedMessage.senderMb && <span className={`badge badge-${selectedMessage.senderMb.provider.toLowerCase()}`}>{selectedMessage.senderMb.provider}</span>}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-3)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Recipient:</span>
                <div style={{ color: 'var(--cyan)', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedMessage.toEmail}
                  {selectedMessage.recipientMb && <span className={`badge badge-${selectedMessage.recipientMb.provider.toLowerCase()}`}>{selectedMessage.recipientMb.provider}</span>}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-3)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Subject:</span>
                <div style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>{selectedMessage.subject}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-3)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Dispatched Timestamp:</span>
                <div style={{ color: 'var(--text-2)', fontSize: '13px', marginTop: '2px' }}>{new Date(selectedMessage.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-3)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Generated Email Body Text:</span>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', color: 'var(--text-1)', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', maxHeight: '220px', overflowY: 'auto' }}>
                {selectedMessage.body}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MAILBOX MODAL */}
      {showAddMailboxModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-bright)', borderRadius: '16px', padding: '32px', width: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>Add New Warmup Mailbox</h2>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-2)' }} onClick={() => setShowAddMailboxModal(false)} />
            </div>

            <form onSubmit={handleAddMailbox} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Provider Group</label>
                <select value={newMailbox.provider} onChange={e => handleProviderChange(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}>
                  <option value="ZOHO">Zoho Mail</option>
                  <option value="GMAIL">Gmail / Google Workspace</option>
                  <option value="OUTLOOK">Microsoft Outlook</option>
                  <option value="MICROSOFT365">Microsoft 365 Enterprise</option>
                  <option value="CUSTOM">Custom SMTP / IMAP (Mailcow)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Email Address</label>
                <input type="email" required placeholder="e.g. alex@yourdomain.com" value={newMailbox.email} onChange={e => setNewMailbox({ ...newMailbox, email: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Display Name</label>
                <input type="text" placeholder="e.g. Alex Morgan" value={newMailbox.displayName} onChange={e => setNewMailbox({ ...newMailbox, displayName: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>SMTP Host</label>
                  <input type="text" required value={newMailbox.smtpHost} onChange={e => setNewMailbox({ ...newMailbox, smtpHost: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>SMTP Port</label>
                  <input type="number" required value={newMailbox.smtpPort} onChange={e => setNewMailbox({ ...newMailbox, smtpPort: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Password / App Password</label>
                <input type="password" required placeholder="••••••••••••" value={newMailbox.smtpPassword} onChange={e => setNewMailbox({ ...newMailbox, smtpPassword: e.target.value, imapPassword: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>IMAP Host</label>
                  <input type="text" required value={newMailbox.imapHost} onChange={e => setNewMailbox({ ...newMailbox, imapHost: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>IMAP Port</label>
                  <input type="number" required value={newMailbox.imapPort} onChange={e => setNewMailbox({ ...newMailbox, imapPort: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Daily Warmup Limit</label>
                <input type="number" required value={newMailbox.warmupDailyLimit} onChange={e => setNewMailbox({ ...newMailbox, warmupDailyLimit: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
              </div>

              <button type="submit" style={{ marginTop: '12px', background: 'linear-gradient(135deg, var(--purple) 0%, var(--cyan) 100%)', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                Save Mailbox & Connect to Supabase
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD DOMAIN MODAL */}
      {showAddDomainModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-bright)', borderRadius: '16px', padding: '32px', width: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>Add New Domain</h2>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-2)' }} onClick={() => setShowAddDomainModal(false)} />
            </div>

            <form onSubmit={handleAddDomain} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px', display: 'block' }}>Domain Name</label>
                <input type="text" required placeholder="e.g. mycompany.work" value={newDomainName} onChange={e => setNewDomainName(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
              </div>

              <button type="submit" style={{ marginTop: '12px', background: 'var(--cyan)', color: '#000', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                Add Domain to Infrastructure
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
