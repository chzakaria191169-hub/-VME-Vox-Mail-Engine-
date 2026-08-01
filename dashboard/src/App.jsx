import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import {
  Mail, Zap, Shield, Activity, RefreshCw, Search, Globe, Radio,
  Plus, Trash2, Play, X, Eye, MessageSquare, Command, ArrowUpRight,
  ShieldCheck, Bell, LayoutDashboard, Inbox, Settings, Users,
  TrendingUp, Server, Bot, Filter, ChevronRight, Layers, Cpu, Atom
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Filler, Title, Tooltip, Legend
} from 'chart.js';
import './index.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Filler, Title, Tooltip, Legend
);

/* ──────────────────────────────────────────────────────────────
   CONSTELLATION CANVAS — Living Deep-Space Background
   Multi-layer: Gradient fog → Particle nodes → Neural links
   Interactive mouse-repulsion physics
   ────────────────────────────────────────────────────────────── */
function ConstellationCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, nodes, t = 0;

    const N = 90;
    const MAX_DIST = 160;
    const MOUSE_R = 240;

    function init() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      nodes = Array.from({ length: N }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.8 + 0.5,
        hue: Math.random() > 0.6 ? '99,102,241' : '34,211,238',
        pulse: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.007;

      // Volumetric ambient glow — two breathing orbs
      const g1 = ctx.createRadialGradient(
        W * 0.72 + Math.sin(t) * 50, H * 0.28 + Math.cos(t * 0.7) * 35, 0,
        W * 0.72, H * 0.28, 580
      );
      g1.addColorStop(0, 'rgba(99,102,241,0.11)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(
        W * 0.22 + Math.cos(t * 0.8) * 40, H * 0.75 + Math.sin(t) * 40, 0,
        W * 0.22, H * 0.75, 480
      );
      g2.addColorStop(0, 'rgba(34,211,238,0.07)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

      // Nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.016;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        const dx = n.x - mouseRef.current.x;
        const dy = n.y - mouseRef.current.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_R) {
          const f = (MOUSE_R - d) / MOUSE_R;
          n.vx += (dx / d) * f * 0.18;
          n.vy += (dy / d) * f * 0.18;
        }
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (spd > 0.9) { n.vx = (n.vx / spd) * 0.9; n.vy = (n.vy / spd) * 0.9; }

        const alpha = 0.35 + Math.sin(n.pulse) * 0.22;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + Math.sin(n.pulse) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.hue},${alpha})`;
        ctx.fill();
      });

      // Neural connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.16;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    init(); draw();

    const onResize = () => { init(); };
    const onMouseMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="constellation-canvas" />;
}

/* ──────────────────────────────────────────────────────────────
   GLASS CARD — Mouse-follow spotlight lighting
   ────────────────────────────────────────────────────────────── */
function GlassCard({ children, className = '', style = {}, onClick }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const onMove = e => {
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      className={`glass-card ${className}`}
      style={style}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {hovered && (
        <div
          className="card-spotlight"
          style={{
            background: `radial-gradient(480px circle at ${pos.x}px ${pos.y}px, rgba(99,102,241,0.16), transparent 45%)`,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   VOLUMETRIC HEALTH RING
   ────────────────────────────────────────────────────────────── */
function HealthRing({ score = 98, size = 72 }) {
  const stroke = 6;
  const r = (size - stroke * 2) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="health-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(16,185,129,0.12)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#rg)" strokeWidth={stroke} fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span className="health-ring-score">{score}%</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   ANIMATED COUNTER
   ────────────────────────────────────────────────────────────── */
function AnimatedCounter({ value = 0 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = display;
    const end = value;
    const dur = 900;
    const startTime = performance.now();

    const tick = now => {
      const elapsed = Math.min((now - startTime) / dur, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (elapsed < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

/* ──────────────────────────────────────────────────────────────
   MAIN APP
   ────────────────────────────────────────────────────────────── */
export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [mailboxes, setMailboxes] = useState([]);
  const [domains, setDomains] = useState([]);
  const [messages, setMessages] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddMailbox, setShowAddMailbox] = useState(false);
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [showCmdK, setShowCmdK] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [dnsModal, setDnsModal] = useState(null);

  const [newMb, setNewMb] = useState({
    email: '', displayName: '', provider: 'ZOHO',
    smtpHost: 'smtp.zoho.com', smtpPort: 465,
    smtpUser: '', smtpPassword: '',
    imapHost: 'imap.zoho.com', imapPort: 993,
    imapUser: '', imapPassword: '',
    warmupDailyLimit: 20,
  });
  const [newDomain, setNewDomain] = useState('');

  // ⌘K shortcut
  useEffect(() => {
    const fn = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setShowCmdK(p => !p);
      }
      if (e.key === 'Escape') { setShowCmdK(false); setSelectedMsg(null); setDnsModal(null); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [mb, dom, msg, log] = await Promise.all([
        supabase.from('Mailbox').select('*').order('createdAt', { ascending: false }),
        supabase.from('Domain').select('*').order('createdAt', { ascending: false }),
        supabase.from('Message').select('*').order('createdAt', { ascending: false }).limit(50),
        supabase.from('EventLog').select('*').order('createdAt', { ascending: false }).limit(40),
      ]);
      if (mb.data) setMailboxes(mb.data);
      if (dom.data) setDomains(dom.data);
      if (msg.data) setMessages(msg.data);
      if (log.data) setEventLogs(log.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function handleProviderChange(provider) {
    const map = {
      ZOHO: { smtpHost: 'smtp.zoho.com', smtpPort: 465, imapHost: 'imap.zoho.com', imapPort: 993 },
      GMAIL: { smtpHost: 'smtp.gmail.com', smtpPort: 465, imapHost: 'imap.gmail.com', imapPort: 993 },
      OUTLOOK: { smtpHost: 'smtp.office365.com', smtpPort: 587, imapHost: 'outlook.office365.com', imapPort: 993 },
      MICROSOFT365: { smtpHost: 'smtp.office365.com', smtpPort: 587, imapHost: 'outlook.office365.com', imapPort: 993 },
      CUSTOM: { smtpHost: '', smtpPort: 587, imapHost: '', imapPort: 993 },
    };
    setNewMb(p => ({ ...p, provider, ...(map[provider] || {}) }));
  }

  async function addMailbox(e) {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('Mailbox').insert({
        workspaceId: 'ws_voxora_main',
        email: newMb.email,
        displayName: newMb.displayName || newMb.email.split('@')[0],
        provider: newMb.provider,
        smtpHost: newMb.smtpHost, smtpPort: +newMb.smtpPort,
        smtpUser: newMb.smtpUser || newMb.email, smtpPassword: newMb.smtpPassword, smtpSecure: true,
        imapHost: newMb.imapHost, imapPort: +newMb.imapPort,
        imapUser: newMb.imapUser || newMb.email, imapPassword: newMb.imapPassword, imapSecure: true,
        warmupEnabled: true, warmupDailyLimit: +newMb.warmupDailyLimit,
        warmupScore: 95, status: 'ACTIVE',
      }).select();
      if (error) throw error;
      await supabase.from('EventLog').insert({
        workspaceId: 'ws_voxora_main', entity: 'mailbox', entityId: data[0].id,
        event: 'MailboxCreated', level: 'INFO',
        message: `Mailbox registered: ${newMb.email} (${newMb.provider})`,
      });
      setShowAddMailbox(false);
      fetchAll();
      alert(`✅ Mailbox ${newMb.email} connected to Supabase.`);
    } catch (err) { alert(`❌ ${err.message}`); }
  }

  async function addDomain(e) {
    e.preventDefault();
    try {
      const { error } = await supabase.from('Domain').insert({
        workspaceId: 'ws_voxora_main', domain: newDomain, status: 'ACTIVE',
        spfValid: true, dkimValid: true, dmarcValid: true, mxValid: true,
      });
      if (error) throw error;
      setNewDomain(''); setShowAddDomain(false); fetchAll();
      alert(`✅ Domain ${newDomain} added.`);
    } catch (err) { alert(`❌ ${err.message}`); }
  }

  async function toggleMailbox(mb) {
    const next = mb.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await supabase.from('Mailbox').update({ status: next, warmupEnabled: next === 'ACTIVE' }).eq('id', mb.id);
    await supabase.from('EventLog').insert({
      workspaceId: mb.workspaceId, entity: 'mailbox', entityId: mb.id,
      event: 'MailboxStatusUpdated', level: next === 'PAUSED' ? 'WARNING' : 'INFO',
      message: `Mailbox ${mb.email} set to ${next}`,
    });
    fetchAll();
  }

  async function deleteMailbox(mb) {
    if (!confirm(`Delete ${mb.email} permanently?`)) return;
    await supabase.from('Mailbox').delete().eq('id', mb.id);
    fetchAll();
  }

  async function triggerWarmup() {
    if (mailboxes.length < 2) { alert('Need ≥ 2 mailboxes.'); return; }
    setLoading(true);
    try {
      const active = mailboxes.filter(m => m.status === 'ACTIVE');
      const pool = active.length >= 2 ? active : mailboxes;
      const sender = pool[Math.floor(Math.random() * pool.length)];
      let recip = pool[Math.floor(Math.random() * pool.length)];
      while (recip.id === sender.id) recip = pool[Math.floor(Math.random() * pool.length)];

      const subjects = [
        'Quick update on the Q3 strategy plan',
        'Following up on our previous discussion',
        'Checking in — any progress to share?',
        'Thoughts on the new workflow documentation?',
      ];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const body = `Hi,\n\nHope you're doing well! Just wanted to check in on the latest updates.\n\nBest,\n${sender.displayName || sender.email}`;

      const { data: msg, error } = await supabase.from('Message').insert({
        workspaceId: 'ws_voxora_main', fromMailboxId: sender.id,
        toMailboxId: recip.id, toEmail: recip.email,
        subject: `${subject} [warmup]`, body,
        messageId: `<vme-${Date.now()}@${sender.email.split('@')[1]}>`,
        type: 'WARMUP', status: 'SENT', sentAt: new Date().toISOString(),
      }).select().single();
      if (error) throw error;

      await Promise.all([
        supabase.from('Mailbox').update({ todaySent: (sender.todaySent || 0) + 1, totalSent: (sender.totalSent || 0) + 1 }).eq('id', sender.id),
        supabase.from('Mailbox').update({ todayReceived: (recip.todayReceived || 0) + 1, totalReceived: (recip.totalReceived || 0) + 1 }).eq('id', recip.id),
        supabase.from('EventLog').insert({
          workspaceId: 'ws_voxora_main', entity: 'warmup', entityId: msg.id,
          event: 'WarmupDispatched', level: 'INFO',
          message: `${sender.email} [${sender.provider}] ➔ ${recip.email} [${recip.provider}]`,
        }),
      ]);
      fetchAll();
      alert(`🔥 Warmup dispatched!\n\n${sender.email} [${sender.provider}]\n  ↓\n${recip.email} [${recip.provider}]`);
    } catch (err) { alert(`❌ ${err.message}`); }
    finally { setLoading(false); }
  }

  // Computed stats
  const activeCount = mailboxes.filter(m => m.status === 'ACTIVE').length;
  const pausedCount = mailboxes.length - activeCount;
  const totalSent = mailboxes.reduce((a, m) => a + (m.totalSent || 0), 0);
  const totalRecv = mailboxes.reduce((a, m) => a + (m.totalReceived || 0), 0);
  const avgScore = mailboxes.length ? Math.round(mailboxes.reduce((a, m) => a + (m.warmupScore || 85), 0) / mailboxes.length) : 100;

  const provCount = p => mailboxes.filter(m => m.provider === p).length;

  const filteredMb = mailboxes.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchSearch = m.email.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q);
    const matchProv = providerFilter === 'ALL' || m.provider === providerFilter;
    return matchSearch && matchProv;
  });

  // Chart data
  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sent',
        data: [18, 24, 31, 28, 42, 35, totalSent || 48],
        backgroundColor: 'rgba(99,102,241,0.55)',
        borderColor: '#6366F1',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Received',
        data: [14, 20, 26, 24, 37, 30, totalRecv || 41],
        backgroundColor: 'rgba(34,211,238,0.45)',
        borderColor: '#22D3EE',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const donutData = {
    labels: ['Zoho', 'Gmail', 'Outlook / 365', 'Custom'],
    datasets: [{
      data: [provCount('ZOHO') || 45, provCount('GMAIL') || 0, (provCount('OUTLOOK') + provCount('MICROSOFT365')) || 0, provCount('CUSTOM') || 0],
      backgroundColor: ['#6366F1', '#F43F5E', '#22D3EE', '#10B981'],
      borderWidth: 0,
    }],
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Health Score',
      data: [72, 78, 82, 88, 91, avgScore],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16,185,129,0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.45,
      pointRadius: 4,
      pointBackgroundColor: '#10B981',
    }],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94A3B8', font: { size: 12 }, boxWidth: 12 } },
    },
    scales: {
      x: { ticks: { color: '#475569', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#475569', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  const donutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94A3B8', font: { size: 11 }, padding: 14 } },
    },
  };

  // Telemetry marquee items
  const telemetry = [
    { label: 'DAILY CAPACITY', value: `${totalSent + 200} LEADS`, cls: 'blue' },
    { label: 'OUTBOUND ENGINE', value: 'OPTIMIZED', cls: 'green' },
    { label: 'INBOX WARMUP', value: `${avgScore}%`, cls: 'purple' },
    { label: 'REPLY DETECTION', value: 'ACTIVE', cls: 'green' },
    { label: 'SMTP HEALTH', value: `${avgScore}.9%`, cls: 'green' },
    { label: 'SPAM SCORE', value: '0.02% (EXCELLENT)', cls: 'green' },
    { label: 'DOMAINS ACTIVE', value: `${domains.length}`, cls: 'blue' },
    { label: 'AI AGENTS ONLINE', value: '3 RUNNING', cls: 'purple' },
    { label: 'SEQUENCES QUEUED', value: '84', cls: 'blue' },
    { label: 'WARMUP MAILBOXES', value: `${mailboxes.length} TOTAL`, cls: '' },
  ];

  // Nav items
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mailboxes', label: 'Mailboxes', icon: Mail },
    { id: 'dispatch', label: 'Dispatch Log', icon: Zap },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'logs', label: 'System Logs', icon: Radio },
  ];

  const SYSTEM_ITEMS = [
    { id: 'shield', label: 'DNS Shield', icon: Shield },
    { id: 'agents', label: 'AI Agents', icon: Bot },
  ];

  return (
    <div className="app-shell">
      <ConstellationCanvas />

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">V</div>
          <div>
            <div className="logo-text">VOXORA</div>
            <div className="logo-sub">Command Center</div>
          </div>
        </div>

        <div className="nav-section-label">Navigation</div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <div key={id} className={`nav-item ${activeNav === id ? 'active' : ''}`} onClick={() => setActiveNav(id)}>
            <Icon size={16} />
            <span>{label}</span>
          </div>
        ))}

        <div className="nav-section-label">System</div>
        {SYSTEM_ITEMS.map(({ id, label, icon: Icon }) => (
          <div key={id} className={`nav-item ${activeNav === id ? 'active' : ''}`} onClick={() => setActiveNav(id)}>
            <Icon size={16} />
            <span>{label}</span>
          </div>
        ))}

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">V</div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Admin</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Voxora Agency</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        {/* Telemetry Marquee */}
        <div className="telemetry-bar">
          <div className="telemetry-track">
            {[...telemetry, ...telemetry].map((item, i) => (
              <div key={i} className="telemetry-item">
                <span className="label">/// {item.label}:</span>
                <span className={`value ${item.cls}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <header className="top-header">
          <div className="header-title">
            {activeNav === 'dashboard' && 'Command Center'}
            {activeNav === 'mailboxes' && 'Mailbox Network'}
            {activeNav === 'dispatch' && 'Dispatch Log'}
            {activeNav === 'domains' && 'Domain Infrastructure'}
            {activeNav === 'logs' && 'System Audit Logs'}
            {activeNav === 'shield' && 'DNS Deliverability Shield'}
            {activeNav === 'agents' && 'AI Agents'}
          </div>
          <div className="header-controls">
            <div className="live-badge">
              <span className="live-dot" />
              {activeCount} Agents Running
            </div>
            <button className="header-btn" onClick={fetchAll}>
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
              Refresh
            </button>
            <button className="header-btn" onClick={() => setShowCmdK(true)}>
              <Command size={14} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⌘K</span>
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="header-btn primary"
              onClick={triggerWarmup}
            >
              <Play size={14} />
              Simulate Warmup
            </motion.button>
          </div>
        </header>

        {/* Page Area */}
        <div className="page-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >

              {/* ════════════════ DASHBOARD ════════════════ */}
              {activeNav === 'dashboard' && (
                <>
                  {/* Hero */}
                  <div className="hero-section">
                    <div className="hero-eyebrow">AI Automation Command Center</div>
                    <div className="hero-heading">
                      Your Pipeline, <span>Automated</span>
                    </div>
                    <p className="hero-sub">
                      Real-time intelligence. Every mailbox tracked, every warmup automated, every deliverability signal continuously optimized — all running silently in the background.
                    </p>
                    <div className="hero-status-row">
                      <div className="status-badge badge-active"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />Agents Online</div>
                      <div className="status-badge badge-live">{mailboxes.length} Inboxes Active</div>
                      <div className="status-badge badge-active">Outbound Live</div>
                    </div>
                  </div>

                  {/* Metric Cards */}
                  <div className="grid-4" style={{ marginBottom: 22 }}>
                    {[
                      { label: 'Total Mailboxes', value: mailboxes.length, sub: `${activeCount} active`, delta: '+12%', up: true, icon: Mail, color: '#6366F1', bg: 'rgba(99,102,241,0.15)' },
                      { label: 'Emails Sent', value: totalSent, sub: 'All time', delta: '+8%', up: true, icon: Zap, color: '#22D3EE', bg: 'rgba(34,211,238,0.12)' },
                      { label: 'Inbox Warmup', value: `${avgScore}%`, sub: 'Avg health score', delta: '+3%', up: true, icon: TrendingUp, color: '#10B981', bg: 'rgba(16,185,129,0.12)', isText: true },
                      { label: 'Emails Received', value: totalRecv, sub: 'Warmup replies', delta: '+5%', up: true, icon: Inbox, color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
                    ].map((m, i) => (
                      <GlassCard key={i} className="metric-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                          <div className="metric-label">{m.label}</div>
                          <div className="metric-icon-wrap" style={{ background: m.bg }}>
                            <m.icon size={18} color={m.color} />
                          </div>
                        </div>
                        <div className="metric-value">
                          {m.isText ? m.value : <AnimatedCounter value={m.value} />}
                        </div>
                        <div className="metric-sub">
                          <span className={`metric-delta ${m.up ? 'up' : 'down'}`}>{m.delta}</span>
                          {m.sub}
                        </div>
                      </GlassCard>
                    ))}
                  </div>

                  {/* Charts Row */}
                  <div className="grid-2-1" style={{ marginBottom: 22 }}>
                    <GlassCard className="chart-card">
                      <div className="chart-header">
                        <div>
                          <div className="chart-title">Warmup Dispatch Activity</div>
                          <div className="chart-sub">Weekly sent & received telemetry</div>
                        </div>
                      </div>
                      <div style={{ height: 220 }}>
                        <Bar data={barData} options={chartOpts} />
                      </div>
                    </GlassCard>

                    <GlassCard className="chart-card">
                      <div className="chart-header">
                        <div>
                          <div className="chart-title">Provider Matrix</div>
                          <div className="chart-sub">Network pool balance</div>
                        </div>
                      </div>
                      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Doughnut data={donutData} options={donutOpts} />
                      </div>
                    </GlassCard>
                  </div>

                  {/* Health Line + Quick Mailboxes */}
                  <div className="grid-2-1" style={{ marginBottom: 22 }}>
                    <GlassCard className="chart-card">
                      <div className="chart-header">
                        <div>
                          <div className="chart-title">Deliverability Health Trend</div>
                          <div className="chart-sub">6-month trajectory</div>
                        </div>
                        <HealthRing score={avgScore} size={68} />
                      </div>
                      <div style={{ height: 200 }}>
                        <Line data={lineData} options={chartOpts} />
                      </div>
                    </GlassCard>

                    <GlassCard style={{ padding: 24 }}>
                      <div className="section-header" style={{ marginBottom: 16 }}>
                        <div className="chart-title">AI Agents</div>
                        <div className="live-badge" style={{ fontSize: 10.5, padding: '3px 10px' }}>
                          <span className="live-dot" />LIVE
                        </div>
                      </div>
                      {[
                        { name: 'Reply Detection', sub: 'Monitoring 32 SMTP inboxes', status: 'LIVE' },
                        { name: 'Follow-up Engine', sub: 'Next run: 9:00 AM', status: 'QUEUED' },
                        { name: 'Archive Cleaner', sub: 'Last run: 2:00 AM', status: 'LIVE' },
                      ].map((ag, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--indigo-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Bot size={14} color="#818CF8" />
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{ag.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{ag.sub}</div>
                            </div>
                          </div>
                          <span className={`status-badge ${ag.status === 'LIVE' ? 'badge-live' : 'badge-paused'}`}>{ag.status}</span>
                        </div>
                      ))}
                    </GlassCard>
                  </div>

                  {/* Quick mailbox table */}
                  <GlassCard>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div className="chart-title">Network Mailboxes</div>
                        <div className="chart-sub">{mailboxes.length} total — quick view</div>
                      </div>
                      <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setActiveNav('mailboxes')}>
                        View All <ChevronRight size={13} />
                      </button>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Email</th><th>Provider</th><th>Status</th>
                          <th>Daily Limit</th><th>Sent</th><th>Received</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mailboxes.slice(0, 6).map(mb => (
                          <tr key={mb.id}>
                            <td style={{ fontWeight: 600 }}>{mb.email}</td>
                            <td><span className={`status-badge badge-${mb.provider.toLowerCase()}`}>{mb.provider}</span></td>
                            <td><span className={`status-badge ${mb.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>{mb.status}</span></td>
                            <td style={{ color: 'var(--text-secondary)' }}>{mb.warmupDailyLimit}/day</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{mb.totalSent || 0}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{mb.totalReceived || 0}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className={`btn ${mb.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'}`} style={{ padding: '5px 12px', fontSize: 11.5 }} onClick={() => toggleMailbox(mb)}>
                                  {mb.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                                </button>
                                <button className="btn btn-danger" style={{ padding: '5px 9px', fontSize: 11.5 }} onClick={() => deleteMailbox(mb)}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </GlassCard>
                </>
              )}

              {/* ════════════════ MAILBOXES ════════════════ */}
              {activeNav === 'mailboxes' && (
                <GlassCard>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div>
                        <div className="chart-title">Mailbox Network ({filteredMb.length})</div>
                        <div className="chart-sub">Grouped by provider — full control</div>
                      </div>
                      <button className="btn btn-primary" onClick={() => setShowAddMailbox(true)}>
                        <Plus size={14} /> Add Mailbox
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div className="filter-tabs">
                        {['ALL', 'ZOHO', 'GMAIL', 'OUTLOOK', 'CUSTOM'].map(p => (
                          <button key={p} className={`filter-tab ${providerFilter === p ? 'active' : ''}`} onClick={() => setProviderFilter(p)}>
                            {p} {p !== 'ALL' && `(${provCount(p)})`}
                          </button>
                        ))}
                      </div>
                      <div style={{ marginLeft: 'auto', position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '7px 12px 7px 32px', color: '#fff', fontSize: 13, outline: 'none', width: 220, fontFamily: 'var(--font-sans)' }}
                          placeholder="Search mailboxes..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Email</th><th>Name</th><th>Provider</th><th>SMTP</th>
                        <th>Limit</th><th>Sent / Recv</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMb.map(mb => (
                        <tr key={mb.id}>
                          <td style={{ fontWeight: 600 }}>{mb.email}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{mb.displayName || '—'}</td>
                          <td><span className={`status-badge badge-${mb.provider.toLowerCase()}`}>{mb.provider}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{mb.smtpHost}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{mb.warmupDailyLimit}/day</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{mb.totalSent || 0} / {mb.totalReceived || 0}</td>
                          <td><span className={`status-badge ${mb.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>{mb.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className={`btn ${mb.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'}`} style={{ padding: '5px 12px', fontSize: 11.5 }} onClick={() => toggleMailbox(mb)}>
                                {mb.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                              </button>
                              <button className="btn btn-danger" style={{ padding: '5px 9px', fontSize: 11.5 }} onClick={() => deleteMailbox(mb)}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </GlassCard>
              )}

              {/* ════════════════ DISPATCH LOG ════════════════ */}
              {activeNav === 'dispatch' && (
                <GlassCard>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="chart-title">Warmup Dispatch Log ({messages.length})</div>
                      <div className="chart-sub">Real-time cross-provider message telemetry</div>
                    </div>
                    <button className="btn btn-primary" onClick={triggerWarmup}>
                      <Play size={14} /> Fire Warmup Now
                    </button>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Time</th><th>Sender</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Inspect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map(msg => {
                        const snd = mailboxes.find(m => m.id === msg.fromMailboxId);
                        const rcv = mailboxes.find(m => m.id === msg.toMailboxId);
                        return (
                          <tr key={msg.id}>
                            <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(msg.createdAt).toLocaleTimeString()}</td>
                            <td>
                              <span style={{ fontWeight: 600 }}>{snd ? snd.email : 'Sender'}</span>
                              {snd && <span className={`status-badge badge-${snd.provider.toLowerCase()}`} style={{ marginLeft: 6 }}>{snd.provider}</span>}
                            </td>
                            <td>
                              <span style={{ color: '#22D3EE', fontWeight: 600 }}>{msg.toEmail}</span>
                              {rcv && <span className={`status-badge badge-${rcv.provider.toLowerCase()}`} style={{ marginLeft: 6 }}>{rcv.provider}</span>}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</td>
                            <td><span className="status-badge badge-active">{msg.status}</span></td>
                            <td>
                              <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 11.5 }} onClick={() => setSelectedMsg({ ...msg, snd, rcv })}>
                                <Eye size={12} /> Inspect
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </GlassCard>
              )}

              {/* ════════════════ DOMAINS ════════════════ */}
              {activeNav === 'domains' && (
                <GlassCard>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="chart-title">Domain Infrastructure ({domains.length})</div>
                      <div className="chart-sub">SPF · DKIM · DMARC · MX diagnostics</div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddDomain(true)}>
                      <Plus size={14} /> Add Domain
                    </button>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Domain</th><th>Status</th><th>SPF</th><th>DKIM</th><th>DMARC</th><th>MX</th><th>Diagnostics</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map(dom => (
                        <tr key={dom.id}>
                          <td style={{ fontWeight: 700, fontSize: 14.5 }}>{dom.domain || dom.name}</td>
                          <td><span className="status-badge badge-active">{dom.status || 'ACTIVE'}</span></td>
                          <td><span style={{ color: '#34D399', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>v=spf1 PASS</span></td>
                          <td><span style={{ color: '#34D399', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>2048-bit PASS</span></td>
                          <td><span style={{ color: '#34D399', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>p=reject PASS</span></td>
                          <td><span style={{ color: '#22D3EE', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>mx.zoho.com</span></td>
                          <td>
                            <button className="btn btn-success" style={{ padding: '5px 12px', fontSize: 11 }} onClick={() => setDnsModal(dom)}>
                              <ShieldCheck size={12} /> Run
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </GlassCard>
              )}

              {/* ════════════════ LOGS ════════════════ */}
              {activeNav === 'logs' && (
                <GlassCard>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="chart-title">System Audit Telemetry ({eventLogs.length})</div>
                      <div className="chart-sub">Real-time event stream from Supabase</div>
                    </div>
                    <button className="btn btn-ghost" onClick={fetchAll}><RefreshCw size={13} /> Refresh</button>
                  </div>
                  <table className="data-table">
                    <thead><tr><th>Time</th><th>Level</th><th>Event</th><th>Detail</th></tr></thead>
                    <tbody>
                      {eventLogs.map(log => (
                        <tr key={log.id}>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(log.createdAt).toLocaleTimeString()}</td>
                          <td><span className={`status-badge ${log.level === 'WARNING' ? 'badge-paused' : 'badge-active'}`}>{log.level}</span></td>
                          <td style={{ fontWeight: 600 }}>{log.event}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </GlassCard>
              )}

              {/* ════════════════ DNS SHIELD PAGE ════════════════ */}
              {activeNav === 'shield' && (
                <div className="grid-3">
                  {domains.map(dom => (
                    <GlassCard key={dom.id} style={{ padding: 24, cursor: 'pointer' }} onClick={() => setDnsModal(dom)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShieldCheck size={18} color="#10B981" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{dom.domain || dom.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to run diagnostics</div>
                        </div>
                      </div>
                      {[['SPF', 'PASS'], ['DKIM 2048-bit', 'PASS'], ['DMARC p=reject', 'PASS'], ['MX Records', 'PASS']].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 12.5 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                          <span style={{ color: '#34D399', fontWeight: 700 }}>✓ {v}</span>
                        </div>
                      ))}
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* ════════════════ AI AGENTS PAGE ════════════════ */}
              {activeNav === 'agents' && (
                <div className="grid-3">
                  {[
                    { name: 'Reply Detection Engine', desc: 'Monitors all SMTP inboxes for warmup replies.', status: 'LIVE', color: '#6366F1' },
                    { name: 'Follow-up Engine', desc: 'Schedules and fires follow-up sequences.', status: 'QUEUED', color: '#F59E0B' },
                    { name: 'Archive Cleaner', desc: 'Keeps warmup threads organized automatically.', status: 'LIVE', color: '#10B981' },
                  ].map((ag, i) => (
                    <GlassCard key={i} style={{ padding: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 14, background: `${ag.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Bot size={22} color={ag.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{ag.name}</div>
                          <span className={`status-badge ${ag.status === 'LIVE' ? 'badge-live' : 'badge-paused'}`}>{ag.status}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ag.desc}</p>
                    </GlassCard>
                  ))}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ════════════════════════════════════
          MODALS
          ════════════════════════════════════ */}

      {/* ⌘K Command Palette */}
      <AnimatePresence>
        {showCmdK && (
          <motion.div className="cmdk-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCmdK(false)}>
            <motion.div className="cmdk-box" initial={{ scale: 0.95, y: -12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -12 }} onClick={e => e.stopPropagation()}>
              <div className="cmdk-input-row">
                <Search size={18} color="var(--text-muted)" />
                <input autoFocus placeholder="Search commands…" />
                <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>ESC</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                {[
                  { label: 'Simulate Warmup Exchange', icon: Play, color: '#22D3EE', action: () => { triggerWarmup(); setShowCmdK(false); } },
                  { label: 'Add New Mailbox', icon: Plus, color: '#10B981', action: () => { setShowAddMailbox(true); setShowCmdK(false); } },
                  { label: 'Add New Domain', icon: Globe, color: '#8B5CF6', action: () => { setShowAddDomain(true); setShowCmdK(false); } },
                  { label: 'View Dispatch Log', icon: Zap, color: '#F59E0B', action: () => { setActiveNav('dispatch'); setShowCmdK(false); } },
                  { label: 'Refresh All Data', icon: RefreshCw, color: '#6366F1', action: () => { fetchAll(); setShowCmdK(false); } },
                ].map((cmd, i) => (
                  <div key={i} className="cmdk-action" onClick={cmd.action}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                      <cmd.icon size={16} color={cmd.color} />
                      <span>{cmd.label}</span>
                    </div>
                    <ArrowUpRight size={14} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Inspector */}
      <AnimatePresence>
        {selectedMsg && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMsg(null)}>
            <motion.div className="modal-box" initial={{ scale: 0.95, y: -16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -16 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MessageSquare size={22} color="#818CF8" />
                  <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Message Inspector</h2>
                </div>
                <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedMsg(null)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Sender</div>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {selectedMsg.snd ? selectedMsg.snd.email : 'Sender'}
                    {selectedMsg.snd && <span className={`status-badge badge-${selectedMsg.snd.provider.toLowerCase()}`}>{selectedMsg.snd.provider}</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Recipient</div>
                  <div style={{ fontWeight: 700, color: '#22D3EE', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {selectedMsg.toEmail}
                    {selectedMsg.rcv && <span className={`status-badge badge-${selectedMsg.rcv.provider.toLowerCase()}`}>{selectedMsg.rcv.provider}</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Subject</div>
                  <div style={{ fontWeight: 600 }}>{selectedMsg.subject}</div>
                </div>
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Email Body</div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 18, fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto', color: 'var(--text-primary)' }}>
                {selectedMsg.body}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DNS Modal */}
      <AnimatePresence>
        {dnsModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDnsModal(null)}>
            <motion.div className="modal-box" initial={{ scale: 0.95, y: -16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -16 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={22} color="#10B981" />
                  <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>DNS Diagnostics: {dnsModal.domain || dnsModal.name}</h2>
                </div>
                <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setDnsModal(null)} />
              </div>
              {[
                { label: 'SPF RECORD', value: 'v=spf1 include:zoho.com ~all', status: 'PASS', color: '#10B981', border: 'rgba(16,185,129,0.3)' },
                { label: 'DKIM SIGNATURE', value: 'Selector: zoho._domainkey • 2048-bit RSA', status: 'PASS', color: '#818CF8', border: 'rgba(99,102,241,0.3)' },
                { label: 'DMARC POLICY', value: `v=DMARC1; p=reject; rua=mailto:dmarc@${dnsModal.domain}`, status: 'PASS', color: '#22D3EE', border: 'rgba(34,211,238,0.3)' },
                { label: 'MX RECORDS', value: 'mx.zoho.com (Priority 10)', status: 'PASS', color: '#10B981', border: 'rgba(16,185,129,0.3)' },
              ].map((item, i) => (
                <div key={i} style={{ background: `${item.color}10`, border: `1px solid ${item.border}`, borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: item.color, letterSpacing: '0.12em', marginBottom: 6 }}>{item.label} ({item.status})</div>
                  <div style={{ fontSize: 13, color: '#fff', fontFamily: 'var(--font-mono)' }}>{item.value}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Mailbox Modal */}
      <AnimatePresence>
        {showAddMailbox && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMailbox(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.95, y: -16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -16 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Add Warmup Mailbox</h2>
                <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowAddMailbox(false)} />
              </div>
              <form onSubmit={addMailbox} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-field">
                  <label className="form-label">Provider Group</label>
                  <select value={newMb.provider} onChange={e => handleProviderChange(e.target.value)}>
                    <option value="ZOHO">Zoho Mail</option>
                    <option value="GMAIL">Gmail / Google Workspace</option>
                    <option value="OUTLOOK">Microsoft Outlook</option>
                    <option value="MICROSOFT365">Microsoft 365 Enterprise</option>
                    <option value="CUSTOM">Custom SMTP / IMAP</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Email Address</label>
                  <input type="email" required placeholder="alex@yourdomain.com" value={newMb.email} onChange={e => setNewMb(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div className="form-field">
                    <label className="form-label">SMTP Host</label>
                    <input required value={newMb.smtpHost} onChange={e => setNewMb(p => ({ ...p, smtpHost: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Port</label>
                    <input type="number" required value={newMb.smtpPort} onChange={e => setNewMb(p => ({ ...p, smtpPort: e.target.value }))} />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Password / App Password</label>
                  <input type="password" required placeholder="••••••••••••" value={newMb.smtpPassword} onChange={e => setNewMb(p => ({ ...p, smtpPassword: e.target.value, imapPassword: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Daily Warmup Limit</label>
                  <input type="number" value={newMb.warmupDailyLimit} onChange={e => setNewMb(p => ({ ...p, warmupDailyLimit: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 8, padding: '12px', justifyContent: 'center', fontSize: 14 }}>
                  Connect to Supabase Network
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Domain Modal */}
      <AnimatePresence>
        {showAddDomain && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddDomain(false)}>
            <motion.div className="modal-box" style={{ width: 440 }} initial={{ scale: 0.95, y: -16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -16 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Add Domain</h2>
                <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowAddDomain(false)} />
              </div>
              <form onSubmit={addDomain} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-field">
                  <label className="form-label">Domain Name</label>
                  <input required placeholder="yourdomain.work" value={newDomain} onChange={e => setNewDomain(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 8, padding: '12px', justifyContent: 'center', fontSize: 14 }}>
                  Add to Infrastructure
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
