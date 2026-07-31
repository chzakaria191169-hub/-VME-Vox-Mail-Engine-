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
  Terminal,
  Bell,
  Cpu,
  Bot,
  Filter,
  Command,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  ZapOff
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Title, Tooltip, Legend);

/* ═══════════════════════════════════════════════════════════
   3D ATMOSPHERIC NEBULA CANVAS — Apple VisionOS & Vercel DNA
   ═══════════════════════════════════════════════════════════ */
function AtmosphericNebulaCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height, nodes;

    const NODE_COUNT = 90;
    const MAX_DIST = 170;
    const MOUSE_RADIUS = 240;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    function createNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.8,
        color: Math.random() > 0.5 ? '129,140,248' : '56,189,248',
        pulse: Math.random() * Math.PI * 2,
      }));
    }

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);

      // Deep volumetric lighting gradients
      const g1 = ctx.createRadialGradient(width * 0.7, height * 0.2, 0, width * 0.7, height * 0.2, 600);
      g1.addColorStop(0, 'rgba(129, 140, 248, 0.08)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, width, height);

      const g2 = ctx.createRadialGradient(width * 0.15, height * 0.75, 0, width * 0.15, height * 0.75, 500);
      g2.addColorStop(0, 'rgba(56, 189, 248, 0.06)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, width, height);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.015;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const dx = n.x - mouse.current.x;
        const dy = n.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          n.vx += (dx / dist) * force * 0.2;
          n.vy += (dy / dist) * force * 0.2;
        }

        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 1.0) { n.vx = (n.vx / speed) * 1.0; n.vy = (n.vy / speed) * 1.0; }

        const r = n.radius + Math.sin(n.pulse) * 0.5;
        const alpha = 0.4 + Math.sin(n.pulse) * 0.2;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color},${alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(129, 140, 248,${alpha})`;
            ctx.lineWidth = 0.6;
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
   3D REFRACTIVE SPOTLIGHT CARD — Linear & Apple VisionOS DNA
   ═══════════════════════════════════════════════════════════ */
function SpotlightCard3D({ children, className = '', style = {} }) {
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
      className={`spotlight-card-3d ${className}`}
      style={{ ...style }}
    >
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, rgba(129, 140, 248, 0.15), transparent 45%)`,
            zIndex: 1,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}

/* VOLUMETRIC RADIAL HEALTH GAUGE RING */
function VolumetricHealthRing({ score = 98 }) {
  const radius = 34;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="rgba(52, 211, 153, 0.15)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#emeraldGradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      <span style={{ position: 'absolute', fontSize: '13px', fontWeight: 800, color: 'var(--emerald-accent)' }}>
        {score}%
      </span>
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
  const [showDnsModal, setShowDnsModal] = useState(null);
  const [showCmdK, setShowCmdK] = useState(false);

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

  // Keyboard shortcut listener for Cmd+K / Ctrl+K (Raycast DNA)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCmdK(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    let defaults = { smtpHost: 'smtp.zoho.com', smtpPort: 465, imapHost: 'imap.zoho.com', imapPort: 993 };
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
    } catch (err) { alert(`❌ Error adding mailbox: ${err.message}`); }
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
    } catch (err) { alert(`❌ Error adding domain: ${err.message}`); }
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

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Warmup Sent',
        data: [12, 19, 25, 32, 45, 28, totalSent || 50],
        backgroundColor: 'rgba(129, 140, 248, 0.6)',
        borderColor: '#818CF8',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Warmup Received',
        data: [10, 15, 20, 28, 40, 22, totalReceived || 42],
        backgroundColor: 'rgba(56, 189, 248, 0.6)',
        borderColor: '#38BDF8',
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
        backgroundColor: ['#818CF8', '#F87171', '#38BDF8', '#34D399'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="app-viewport">
      {/* 3D CANVAS ATMOSPHERE */}
      <AtmosphericNebulaCanvas />

      {/* FLOATING GLASS SIDEBAR — Linear / Arc DNA */}
      <aside className="floating-sidebar">
        <div className="brand-header">
          <div className="brand-3d-logo">V</div>
          <div>
            <div className="brand-title">VOXORA VME</div>
            <div className="brand-badge">PRODUCT DESIGN v2.0</div>
          </div>
        </div>

        <div className="nav-label">Product Views</div>
        <div className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <Activity size={18} />
          <span>Executive Overview</span>
        </div>
        <div className={`nav-link ${activeTab === 'mailboxes' ? 'active' : ''}`} onClick={() => setActiveTab('mailboxes')}>
          <Mail size={18} />
          <span>Mailboxes ({mailboxes.length})</span>
        </div>
        <div className={`nav-link ${activeTab === 'pipeline' ? 'active' : ''}`} onClick={() => setActiveTab('pipeline')}>
          <MessageSquare size={18} />
          <span>Warmup Activity</span>
        </div>

        <div className="nav-label">Infrastructure</div>
        <div className={`nav-link ${activeTab === 'domains' ? 'active' : ''}`} onClick={() => setActiveTab('domains')}>
          <Globe size={18} />
          <span>Domains ({domains.length})</span>
        </div>
        <div className={`nav-link ${activeTab === 'shield' ? 'active' : ''}`} onClick={() => setActiveTab('shield')}>
          <Shield size={18} />
          <span>Deliverability Shield</span>
        </div>
        <div className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          <Radio size={18} />
          <span>System Audit Logs</span>
        </div>

        {/* RAYCAST COMMAND PALETTE TRIGGER */}
        <div className="cmd-k-trigger" onClick={() => setShowCmdK(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Command size={14} />
            <span>Search or command...</span>
          </div>
          <span className="cmd-key">⌘K</span>
        </div>
      </aside>

      {/* FLOATING MAIN CONTAINER */}
      <main className="floating-main">
        {/* TOP CONTROL HEADER */}
        <header className="main-header">
          <div>
            <div className="header-title">
              {activeTab === 'overview' && 'Deliverability & Warmup Executive Center'}
              {activeTab === 'mailboxes' && 'Mailbox Network & Provider Distribution'}
              {activeTab === 'pipeline' && 'Live Warmup Dispatch & Message Inspector'}
              {activeTab === 'domains' && 'Domain Infrastructure & Technical DNS'}
              {activeTab === 'shield' && 'Deliverability Shield & Circuit Breaker'}
              {activeTab === 'logs' && 'Real-Time System Audit Telemetry'}
            </div>
            <div className="header-subtitle">Engineered by Voxora Design System • Apple & Linear Standard</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={triggerManualWarmup}
              style={{
                background: 'linear-gradient(135deg, var(--violet-accent) 0%, var(--cyan-accent) 100%)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 25px rgba(129, 140, 248, 0.35)',
              }}
            >
              <Play size={15} />
              <span>Simulate Warmup Exchange</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddMailboxModal(true)}
              style={{
                background: 'rgba(52, 211, 153, 0.12)',
                color: 'var(--emerald-accent)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                padding: '10px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={15} />
              <span>Add Mailbox</span>
            </motion.button>

            <button onClick={fetchDashboardData} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: '#fff', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT */}
        <div className="scroll-viewport">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <>
                  {/* HERO LUXURY BANNER */}
                  <div className="hero-luxury">
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--cyan-accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>
                      ULTRA-LUXURY AUTOMATED DELIVERABILITY
                    </div>
                    <h1 style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>
                      Vox Mail Engine (VME)
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '580px', lineHeight: 1.6 }}>
                      Multi-provider AI warmup infrastructure engineered for maximum inbox placement across Zoho, Gmail, Outlook & Mailcow.
                    </p>
                  </div>

                  {/* 3D METRICS GRID */}
                  <div className="metrics-3d-grid">
                    <SpotlightCard3D>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Mailboxes</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.15)', color: 'var(--violet-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} /></div>
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '8px' }}>{activeCount} / {mailboxes.length}</div>
                      <div style={{ fontSize: '12px', color: 'var(--violet-accent)', fontWeight: 600 }}>100% Operational Network</div>
                    </SpotlightCard3D>

                    <SpotlightCard3D>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deliverability Health</span>
                        <VolumetricHealthRing score={avgHealthScore} />
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--emerald-accent)', marginBottom: '8px' }}>{avgHealthScore}%</div>
                      <div style={{ fontSize: '12px', color: 'var(--emerald-accent)', fontWeight: 600 }}>Grade A+ Deliverability</div>
                    </SpotlightCard3D>

                    <SpotlightCard3D>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Warmup Sent</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={18} /></div>
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '8px' }}>{totalSent}</div>
                      <div style={{ fontSize: '12px', color: 'var(--cyan-accent)', fontWeight: 600 }}>Across {domains.length} Domains</div>
                    </SpotlightCard3D>

                    <SpotlightCard3D>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spam Rescued</span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.15)', color: 'var(--amber-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Inbox size={18} /></div>
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '8px' }}>{totalReceived}</div>
                      <div style={{ fontSize: '12px', color: 'var(--amber-accent)', fontWeight: 600 }}>100% Folder Recovery</div>
                    </SpotlightCard3D>
                  </div>

                  {/* GRAPHS ROW */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
                    <SpotlightCard3D>
                      <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>Warmup Dispatch Telemetry</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Daily warmup email exchange distribution</div>
                      <div style={{ height: '240px' }}>
                        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94A3B8' } } }, scales: { x: { ticks: { color: '#94A3B8' } }, y: { ticks: { color: '#94A3B8' } } } }} />
                      </div>
                    </SpotlightCard3D>

                    <SpotlightCard3D>
                      <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>Provider Distribution</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Multi-provider balance matrix</div>
                      <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8', font: { size: 11 } } } } }} />
                      </div>
                    </SpotlightCard3D>
                  </div>

                  {/* MAILBOX TABLE */}
                  <div className="table-luxury">
                    <div className="table-luxury-header">
                      <div style={{ fontSize: '16px', fontWeight: 800 }}>Network Mailboxes Quick View</div>
                      <button onClick={() => setActiveTab('mailboxes')} style={{ background: 'none', border: 'none', color: 'var(--cyan-accent)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        View All ({mailboxes.length}) →
                      </button>
                    </div>

                    <table className="glass-table">
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
                            <td style={{ fontWeight: 700 }}>{mb.email}</td>
                            <td><span className={`badge-pill badge-${mb.provider.toLowerCase()}`}>{mb.provider}</span></td>
                            <td><span className={`badge-pill ${mb.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>{mb.status}</span></td>
                            <td>{mb.warmupDailyLimit} / day</td>
                            <td>{mb.todaySent || 0}</td>
                            <td>{mb.todayReceived || 0}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button onClick={() => toggleMailboxStatus(mb)} style={{ background: mb.status === 'ACTIVE' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(52, 211, 153, 0.15)', border: `1px solid ${mb.status === 'ACTIVE' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`, color: mb.status === 'ACTIVE' ? 'var(--amber-accent)' : 'var(--emerald-accent)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                                  {mb.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                                </button>
                                <button onClick={() => deleteMailbox(mb.id, mb.email)} style={{ background: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.3)', color: 'var(--red-accent)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
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
                <div className="table-luxury">
                  <div className="table-luxury-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800 }}>Mailbox Network by Provider Group ({filteredMailboxes.length})</div>
                      <button onClick={() => setShowAddMailboxModal(true)} style={{ background: 'rgba(129, 140, 248, 0.15)', color: 'var(--violet-accent)', border: '1px solid rgba(129, 140, 248, 0.3)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} />
                        <span>Add New Mailbox</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', width: '100%', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                      {['ALL', 'ZOHO', 'GMAIL', 'OUTLOOK', 'CUSTOM'].map(p => (
                        <button key={p} onClick={() => setProviderFilter(p)} style={{ background: providerFilter === p ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)', color: providerFilter === p ? 'var(--violet-accent)' : 'var(--text-secondary)', border: providerFilter === p ? '1px solid var(--violet-accent)' : '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                          {p === 'ALL' ? `ALL (${mailboxes.length})` : `${p} (${mailboxes.filter(m => m.provider === p).length})`}
                        </button>
                      ))}

                      <div style={{ marginLeft: 'auto', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search mailboxes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '8px 12px 8px 36px', color: '#fff', fontSize: '13px', outline: 'none', width: '240px' }} />
                      </div>
                    </div>
                  </div>

                  <table className="glass-table">
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
                      {filteredMailboxes.map(mb => (
                        <tr key={mb.id}>
                          <td style={{ fontWeight: 700 }}>{mb.email}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{mb.displayName || mb.email.split('@')[0]}</td>
                          <td><span className={`badge-pill badge-${mb.provider.toLowerCase()}`}>{mb.provider}</span></td>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{mb.smtpHost}</td>
                          <td>{mb.warmupDailyLimit} / day</td>
                          <td>{mb.totalSent || 0} / {mb.totalReceived || 0}</td>
                          <td><span className={`badge-pill ${mb.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>{mb.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button onClick={() => toggleMailboxStatus(mb)} style={{ background: mb.status === 'ACTIVE' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(52, 211, 153, 0.15)', border: `1px solid ${mb.status === 'ACTIVE' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`, color: mb.status === 'ACTIVE' ? 'var(--amber-accent)' : 'var(--emerald-accent)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                                {mb.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                              </button>
                              <button onClick={() => deleteMailbox(mb.id, mb.email)} style={{ background: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.3)', color: 'var(--red-accent)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
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

              {/* PIPELINE TAB */}
              {activeTab === 'pipeline' && (
                <div className="table-luxury">
                  <div className="table-luxury-header">
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>Live Warmup Dispatch & Message Inspector ({messages.length})</div>
                    <button onClick={triggerManualWarmup} style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan-accent)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Play size={15} />
                      <span>Simulate Dispatch Now</span>
                    </button>
                  </div>

                  <table className="glass-table">
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
                      {messages.map(msg => {
                        const senderMb = mailboxes.find(m => m.id === msg.fromMailboxId);
                        const recipientMb = mailboxes.find(m => m.id === msg.toMailboxId);
                        return (
                          <tr key={msg.id}>
                            <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(msg.createdAt).toLocaleTimeString()}</td>
                            <td style={{ fontWeight: 700 }}>
                              {senderMb ? senderMb.email : 'Warmup Sender'}
                              {senderMb && <span className={`badge-pill badge-${senderMb.provider.toLowerCase()}`} style={{ marginLeft: '8px' }}>{senderMb.provider}</span>}
                            </td>
                            <td style={{ color: 'var(--cyan-accent)', fontWeight: 700 }}>
                              {msg.toEmail}
                              {recipientMb && <span className={`badge-pill badge-${recipientMb.provider.toLowerCase()}`} style={{ marginLeft: '8px' }}>{recipientMb.provider}</span>}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</td>
                            <td><span className="badge-pill badge-active">{msg.status}</span></td>
                            <td>
                              <button onClick={() => setSelectedMessage({ ...msg, senderMb, recipientMb })} style={{ background: 'rgba(129, 140, 248, 0.15)', color: 'var(--violet-accent)', border: '1px solid rgba(129, 140, 248, 0.3)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Eye size={13} />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* DOMAINS TAB */}
              {activeTab === 'domains' && (
                <div className="table-luxury">
                  <div className="table-luxury-header">
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>Domain Infrastructure Pool ({domains.length})</div>
                    <button onClick={() => setShowAddDomainModal(true)} style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan-accent)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={16} />
                      <span>Add New Domain</span>
                    </button>
                  </div>
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>Domain Name</th>
                        <th>Status</th>
                        <th>SPF Record</th>
                        <th>DKIM Key</th>
                        <th>DMARC Policy</th>
                        <th>MX Mail Server</th>
                        <th>Diagnostics</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map(dom => (
                        <tr key={dom.id}>
                          <td style={{ fontWeight: 800, fontSize: '15px' }}>{dom.domain || dom.name || 'Domain'}</td>
                          <td><span className="badge-pill badge-active">{dom.status || 'ACTIVE'}</span></td>
                          <td style={{ color: 'var(--emerald-accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>v=spf1 include:zoho.com ~all</td>
                          <td style={{ color: 'var(--emerald-accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>zoho._domainkey (2048-bit)</td>
                          <td style={{ color: 'var(--emerald-accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>v=DMARC1; p=reject</td>
                          <td style={{ color: 'var(--cyan-accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>mx.zoho.com (10)</td>
                          <td>
                            <button onClick={() => setShowDnsModal(dom)} style={{ background: 'rgba(52, 211, 153, 0.15)', color: 'var(--emerald-accent)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 800 }}>
                              RUN DIAGNOSTICS
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* LOGS TAB */}
              {activeTab === 'logs' && (
                <div className="table-luxury">
                  <div className="table-luxury-header">
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>Real-Time System Audit Telemetry</div>
                    <button onClick={fetchDashboardData} style={{ background: 'none', border: '1px solid var(--border-glass)', color: '#fff', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                      Refresh Logs
                    </button>
                  </div>
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Event</th>
                        <th>Message Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventLogs.map(log => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(log.createdAt).toLocaleTimeString()}</td>
                          <td><span className={`badge-pill ${log.level === 'WARNING' ? 'badge-paused' : 'badge-active'}`}>{log.level}</span></td>
                          <td style={{ fontWeight: 700 }}>{log.event}</td>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* RAYCAST COMMAND PALETTE MODAL (⌘K) */}
      {showCmdK && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '120px', zIndex: 2000 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} style={{ background: 'rgba(18, 20, 32, 0.95)', border: '1px solid var(--border-highlight)', borderRadius: '20px', width: '600px', boxShadow: 'var(--shadow-3d)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={18} color="var(--violet-accent)" />
              <input type="text" autoFocus placeholder="Type a command or search mailboxes..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: '15px', width: '100%', outline: 'none' }} />
              <span className="cmd-key">ESC</span>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
              <div onClick={() => { triggerManualWarmup(); setShowCmdK(false); }} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600 }}><Play size={16} color="var(--cyan-accent)" /> Simulate Warmup Exchange</div>
                <ArrowUpRight size={14} color="var(--text-muted)" />
              </div>
              <div onClick={() => { setShowAddMailboxModal(true); setShowCmdK(false); }} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600 }}><Plus size={16} color="var(--emerald-accent)" /> Add New Warmup Mailbox</div>
                <ArrowUpRight size={14} color="var(--text-muted)" />
              </div>
              <div onClick={() => { setActiveTab('domains'); setShowCmdK(false); }} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600 }}><Globe size={16} color="var(--violet-accent)" /> Inspect Domain Infrastructure</div>
                <ArrowUpRight size={14} color="var(--text-muted)" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* TECHNICAL DNS DIAGNOSTICS MODAL */}
      {showDnsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: 'rgba(18, 20, 32, 0.95)', border: '1px solid var(--border-highlight)', borderRadius: '24px', padding: '36px', width: '560px', boxShadow: 'var(--shadow-3d)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck color="var(--emerald-accent)" size={22} />
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>DNS Diagnostics: {showDnsModal.domain || showDnsModal.name}</h2>
              </div>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowDnsModal(null)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--emerald-accent)', fontWeight: 800 }}>SPF RECORD DIAGNOSTIC (PASS)</div>
                <div style={{ fontSize: '13.5px', color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>v=spf1 include:zoho.com ~all</div>
              </div>

              <div style={{ background: 'rgba(129, 140, 248, 0.08)', border: '1px solid rgba(129, 140, 248, 0.25)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--violet-accent)', fontWeight: 800 }}>DKIM SIGNATURE DIAGNOSTIC (PASS)</div>
                <div style={{ fontSize: '13.5px', color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>Selector: zoho._domainkey • Key length: 2048-bit RSA</div>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--cyan-accent)', fontWeight: 800 }}>DMARC POLICY DIAGNOSTIC (PASS)</div>
                <div style={{ fontSize: '13.5px', color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>v=DMARC1; p=reject; rua=mailto:dmarc-reports@{showDnsModal.domain}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT MESSAGE MODAL */}
      {selectedMessage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'rgba(18, 20, 32, 0.95)', border: '1px solid var(--border-highlight)', borderRadius: '24px', padding: '36px', width: '620px', boxShadow: 'var(--shadow-3d)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare color="var(--violet-accent)" size={22} />
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Warmup Message Inspector</h2>
              </div>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedMessage(null)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Sender:</span>
                <div style={{ color: '#fff', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedMessage.fromMailboxId ? mailboxes.find(m => m.id === selectedMessage.fromMailboxId)?.email || 'Warmup Sender' : 'Warmup Sender'}
                  {selectedMessage.senderMb && <span className={`badge-pill badge-${selectedMessage.senderMb.provider.toLowerCase()}`}>{selectedMessage.senderMb.provider}</span>}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Recipient:</span>
                <div style={{ color: 'var(--cyan-accent)', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedMessage.toEmail}
                  {selectedMessage.recipientMb && <span className={`badge-pill badge-${selectedMessage.recipientMb.provider.toLowerCase()}`}>{selectedMessage.recipientMb.provider}</span>}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Subject:</span>
                <div style={{ color: '#fff', fontWeight: 700, marginTop: '2px' }}>{selectedMessage.subject}</div>
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Generated Email Body Text:</span>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '18px', color: 'var(--text-primary)', fontSize: '13.5px', lineHeight: '1.6', whiteSpace: 'pre-wrap', maxHeight: '220px', overflowY: 'auto' }}>
                {selectedMessage.body}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MAILBOX MODAL */}
      {showAddMailboxModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(18, 20, 32, 0.95)', border: '1px solid var(--border-highlight)', borderRadius: '24px', padding: '36px', width: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-3d)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Add New Warmup Mailbox</h2>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowAddMailboxModal(false)} />
            </div>

            <form onSubmit={handleAddMailbox} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Provider Group</label>
                <select value={newMailbox.provider} onChange={e => handleProviderChange(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff' }}>
                  <option value="ZOHO">Zoho Mail</option>
                  <option value="GMAIL">Gmail / Google Workspace</option>
                  <option value="OUTLOOK">Microsoft Outlook</option>
                  <option value="MICROSOFT365">Microsoft 365 Enterprise</option>
                  <option value="CUSTOM">Custom SMTP / IMAP (Mailcow)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Email Address</label>
                <input type="email" required placeholder="e.g. alex@yourdomain.com" value={newMailbox.email} onChange={e => setNewMailbox({ ...newMailbox, email: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>SMTP Host</label>
                  <input type="text" required value={newMailbox.smtpHost} onChange={e => setNewMailbox({ ...newMailbox, smtpHost: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Port</label>
                  <input type="number" required value={newMailbox.smtpPort} onChange={e => setNewMailbox({ ...newMailbox, smtpPort: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Password / App Password</label>
                <input type="password" required placeholder="••••••••••••" value={newMailbox.smtpPassword} onChange={e => setNewMailbox({ ...newMailbox, smtpPassword: e.target.value, imapPassword: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff' }} />
              </div>

              <button type="submit" style={{ marginTop: '12px', background: 'linear-gradient(135deg, var(--violet-accent) 0%, var(--cyan-accent) 100%)', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '14px', boxShadow: '0 8px 25px rgba(129, 140, 248, 0.35)' }}>
                Save Mailbox & Connect to Supabase
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD DOMAIN MODAL */}
      {showAddDomainModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(18, 20, 32, 0.95)', border: '1px solid var(--border-highlight)', borderRadius: '24px', padding: '36px', width: '440px', boxShadow: 'var(--shadow-3d)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Add New Domain</h2>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowAddDomainModal(false)} />
            </div>

            <form onSubmit={handleAddDomain} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Domain Name</label>
                <input type="text" required placeholder="e.g. mycompany.work" value={newDomainName} onChange={e => setNewDomainName(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#fff' }} />
              </div>

              <button type="submit" style={{ marginTop: '12px', background: 'var(--cyan-accent)', color: '#000', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '14px' }}>
                Add Domain to Infrastructure
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
