import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import {
  Mail, Zap, RefreshCw, Search, Globe, Plus, Trash2, Play, X,
  Eye, MessageSquare, Command, ArrowUpRight, ShieldCheck, Bell,
  LayoutDashboard, Inbox, Settings, TrendingUp, Bot, ChevronDown,
  Filter, Radio, BarChart2
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Filler, Title, Tooltip, Legend
} from 'chart.js';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Filler, Title, Tooltip, Legend);

/* ═══════════════════════════════════════════════════════════════
   STAR CANVAS  — same constellation style as Voxora CRM
   subtle dots, thin neural lines, soft ambient orbs
═══════════════════════════════════════════════════════════════ */
function StarCanvas({ className = 'star-canvas' }) {
  const ref = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    let W, H, pts, t = 0;

    function init() {
      W = cv.width = cv.offsetWidth;
      H = cv.height = cv.offsetHeight;
      pts = Array.from({ length: 70 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.4 + 0.4,
        c: Math.random() > 0.55 ? '99,102,241' : '34,211,238',
        ph: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.006;

      // Two ambient orbs
      const o1 = ctx.createRadialGradient(W * 0.75 + Math.sin(t) * 40, H * 0.25 + Math.cos(t * 0.7) * 30, 0, W * 0.75, H * 0.25, 500);
      o1.addColorStop(0, 'rgba(99,102,241,0.08)');
      o1.addColorStop(1, 'transparent');
      ctx.fillStyle = o1; ctx.fillRect(0, 0, W, H);

      const o2 = ctx.createRadialGradient(W * 0.25 + Math.cos(t * 0.8) * 35, H * 0.75 + Math.sin(t) * 35, 0, W * 0.25, H * 0.75, 420);
      o2.addColorStop(0, 'rgba(34,211,238,0.05)');
      o2.addColorStop(1, 'transparent');
      ctx.fillStyle = o2; ctx.fillRect(0, 0, W, H);

      // Points
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.ph += 0.014;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        // mouse repulsion
        const dx = p.x - mouse.current.x, dy = p.y - mouse.current.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 200) { const f = (200 - d) / 200; p.vx += dx / d * f * 0.15; p.vy += dy / d * f * 0.15; }
        const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (sp > 0.8) { p.vx = p.vx / sp * 0.8; p.vy = p.vy / sp * 0.8; }

        const a = 0.3 + Math.sin(p.ph) * 0.18;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + Math.sin(p.ph) * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${a})`;
        ctx.fill();
      });

      // Neural links
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const al = (1 - Math.sqrt(d2) / 140) * 0.13;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${al})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf.current = requestAnimationFrame(draw);
    }

    init(); draw();
    const onR = () => init();
    const onM = e => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('resize', onR);
    window.addEventListener('mousemove', onM);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', onR);
      window.removeEventListener('mousemove', onM);
    };
  }, []);

  return <canvas ref={ref} className={className} />;
}

/* ═══════════════════════════════════════════════════════════════
   HERO CANVAS  — smaller constellation inside the hero card
═══════════════════════════════════════════════════════════════ */
function HeroCanvas() {
  const ref = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    let W, H, pts, t = 0;

    function init() {
      W = cv.width = cv.offsetWidth;
      H = cv.height = cv.offsetHeight;
      pts = Array.from({ length: 45 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.2 + 0.3,
        c: Math.random() > 0.5 ? '99,102,241' : '34,211,238',
        ph: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.005;
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.ph += 0.012;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const a = 0.25 + Math.sin(p.ph) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${a})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 120) * 0.12})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      raf.current = requestAnimationFrame(draw);
    }

    init(); draw();
    const onR = () => init();
    window.addEventListener('resize', onR);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', onR); };
  }, []);

  return <canvas ref={ref} className="hero-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

/* ═══════════════════════════════════════════════════════════════
   WORLD MAP CANVAS — simple dot-matrix map like Voxora CRM
═══════════════════════════════════════════════════════════════ */
function WorldMapCanvas() {
  const ref = useRef(null);
  const raf = useRef(null);

  const dots = [
    // North America
    [15, 32], [18, 35], [20, 30], [22, 35], [25, 33], [28, 36], [30, 34],
    // Europe
    [46, 25], [48, 27], [50, 25], [52, 28], [54, 26], [56, 30], [58, 28], [60, 25],
    // Asia
    [65, 27], [68, 30], [70, 25], [72, 32], [75, 28], [78, 35], [80, 28],
    // Africa
    [48, 42], [50, 45], [52, 48], [55, 50], [58, 44],
    // South America
    [25, 52], [28, 55], [30, 58], [32, 54],
    // Australia
    [75, 52], [78, 55], [80, 52],
    // Southeast Asia
    [72, 40], [75, 43], [78, 45], [80, 42],
  ];

  // Warmup signal dots (highlighted/animated)
  const signals = [
    { x: 48, y: 26, color: '34,211,238' },
    { x: 72, y: 30, color: '99,102,241' },
    { x: 22, y: 34, color: '34,211,238' },
    { x: 75, y: 52, color: '99,102,241' },
    { x: 50, y: 46, color: '16,185,129' },
  ];

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    let t = 0;

    function draw() {
      const W = cv.offsetWidth, H = cv.offsetHeight;
      cv.width = W; cv.height = H;
      ctx.clearRect(0, 0, W, H);
      t += 0.04;

      // Background map dots (static dim)
      dots.forEach(([px, py]) => {
        const x = (px / 100) * W;
        const y = (py / 100) * H;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.09)';
        ctx.fill();
      });

      // Animated signal dots
      signals.forEach(s => {
        const x = (s.x / 100) * W;
        const y = (s.y / 100) * H;
        const pulse = (Math.sin(t + s.x) + 1) / 2;

        // Ripple
        ctx.beginPath();
        ctx.arc(x, y, 8 + pulse * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${s.color},${0.2 * (1 - pulse)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},0.9)`;
        ctx.fill();

        // Glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
        g.addColorStop(0, `rgba(${s.color},0.3)`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
      });

      // Thin connection lines between signals
      for (let i = 0; i < signals.length; i++) {
        for (let j = i + 1; j < signals.length; j++) {
          const a = signals[i], b = signals[j];
          const ax = (a.x / 100) * W, ay = (a.y / 100) * H;
          const bx = (b.x / 100) * W, by = (b.y / 100) * H;
          const d = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
          if (d < W * 0.4) {
            ctx.beginPath();
            ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(99,102,241,${0.08 + Math.sin(t) * 0.04})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      raf.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} className="world-map-canvas" />;
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════════════ */
function Counter({ val }) {
  const [n, setN] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const end = val, dur = 800, st = performance.now();
    const tick = now => {
      const p = Math.min((now - st) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(end * e));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [val]);
  return <>{n.toLocaleString()}</>;
}

/* ═══════════════════════════════════════════════════════════════
   MOUSE-FOLLOW CARD WRAPPER
═══════════════════════════════════════════════════════════════ */
function Card({ children, className = '', style = {}, onClick }) {
  const ref = useRef(null);
  const [glow, setGlow] = useState(null);

  return (
    <div
      ref={ref}
      className={`card ${className}`}
      style={style}
      onClick={onClick}
      onMouseMove={e => {
        const r = ref.current.getBoundingClientRect();
        setGlow({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseLeave={() => setGlow(null)}
    >
      {glow && (
        <div
          className="card-glow"
          style={{
            background: `radial-gradient(400px circle at ${glow.x}px ${glow.y}px, rgba(99,102,241,0.13), transparent 50%)`
          }}
        />
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [nav, setNav] = useState('dashboard');
  const [mailboxes, setMailboxes] = useState([]);
  const [domains, setDomains] = useState([]);
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [q, setQ] = useState('');
  const [addMb, setAddMb] = useState(false);
  const [addDom, setAddDom] = useState(false);
  const [cmdK, setCmdK] = useState(false);
  const [selMsg, setSelMsg] = useState(null);
  const [dnsMod, setDnsMod] = useState(null);

  const [mb, setMb] = useState({
    email: '', displayName: '', provider: 'ZOHO',
    smtpHost: 'smtp.zoho.com', smtpPort: 465,
    smtpUser: '', smtpPassword: '',
    imapHost: 'imap.zoho.com', imapPort: 993,
    imapUser: '', imapPassword: '',
    warmupDailyLimit: 20,
  });
  const [dom, setDom] = useState('');

  // ⌘K
  useEffect(() => {
    const fn = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdK(p => !p); }
      if (e.key === 'Escape') { setCmdK(false); setSelMsg(null); setDnsMod(null); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        supabase.from('Mailbox').select('*').order('createdAt', { ascending: false }),
        supabase.from('Domain').select('*').order('createdAt', { ascending: false }),
        supabase.from('Message').select('*').order('createdAt', { ascending: false }).limit(50),
        supabase.from('EventLog').select('*').order('createdAt', { ascending: false }).limit(40),
      ]);
      if (r1.data) setMailboxes(r1.data);
      if (r2.data) setDomains(r2.data);
      if (r3.data) setMessages(r3.data);
      if (r4.data) setLogs(r4.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function setProvider(p) {
    const m = {
      ZOHO: { smtpHost: 'smtp.zoho.com', smtpPort: 465, imapHost: 'imap.zoho.com', imapPort: 993 },
      GMAIL: { smtpHost: 'smtp.gmail.com', smtpPort: 465, imapHost: 'imap.gmail.com', imapPort: 993 },
      OUTLOOK: { smtpHost: 'smtp.office365.com', smtpPort: 587, imapHost: 'outlook.office365.com', imapPort: 993 },
      MICROSOFT365: { smtpHost: 'smtp.office365.com', smtpPort: 587, imapHost: 'outlook.office365.com', imapPort: 993 },
      CUSTOM: { smtpHost: '', smtpPort: 587, imapHost: '', imapPort: 993 },
    };
    setMb(prev => ({ ...prev, provider: p, ...(m[p] || {}) }));
  }

  async function submitMailbox(e) {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('Mailbox').insert({
        workspaceId: 'ws_voxora_main',
        email: mb.email,
        displayName: mb.displayName || mb.email.split('@')[0],
        provider: mb.provider,
        smtpHost: mb.smtpHost, smtpPort: +mb.smtpPort,
        smtpUser: mb.smtpUser || mb.email, smtpPassword: mb.smtpPassword, smtpSecure: true,
        imapHost: mb.imapHost, imapPort: +mb.imapPort,
        imapUser: mb.imapUser || mb.email, imapPassword: mb.imapPassword, imapSecure: true,
        warmupEnabled: true, warmupDailyLimit: +mb.warmupDailyLimit,
        warmupScore: 95, status: 'ACTIVE',
      }).select();
      if (error) throw error;
      await supabase.from('EventLog').insert({
        workspaceId: 'ws_voxora_main', entity: 'mailbox', entityId: data[0].id,
        event: 'MailboxCreated', level: 'INFO',
        message: `Mailbox registered: ${mb.email} (${mb.provider})`,
      });
      setAddMb(false); fetchAll();
      alert(`✅ ${mb.email} connected!`);
    } catch (err) { alert(`❌ ${err.message}`); }
  }

  async function submitDomain(e) {
    e.preventDefault();
    try {
      const { error } = await supabase.from('Domain').insert({
        workspaceId: 'ws_voxora_main', domain: dom, status: 'ACTIVE',
        spfValid: true, dkimValid: true, dmarcValid: true, mxValid: true,
      });
      if (error) throw error;
      setDom(''); setAddDom(false); fetchAll();
      alert(`✅ Domain ${dom} added.`);
    } catch (err) { alert(`❌ ${err.message}`); }
  }

  async function toggleMb(item) {
    const next = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await supabase.from('Mailbox').update({ status: next, warmupEnabled: next === 'ACTIVE' }).eq('id', item.id);
    fetchAll();
  }

  async function deleteMb(item) {
    if (!confirm(`Delete ${item.email}?`)) return;
    await supabase.from('Mailbox').delete().eq('id', item.id);
    fetchAll();
  }

  async function fireWarmup() {
    if (mailboxes.length < 2) { alert('Need at least 2 mailboxes.'); return; }
    setLoading(true);
    try {
      const active = mailboxes.filter(m => m.status === 'ACTIVE');
      const pool = active.length >= 2 ? active : mailboxes;
      const sender = pool[Math.floor(Math.random() * pool.length)];
      let recip = pool[Math.floor(Math.random() * pool.length)];
      while (recip.id === sender.id) recip = pool[Math.floor(Math.random() * pool.length)];

      const subjects = [
        'Quick check-in on the campaign progress',
        'Following up on our discussion',
        'Thoughts on the outreach strategy?',
        'Q3 pipeline — any updates to share?',
      ];
      const subj = subjects[Math.floor(Math.random() * subjects.length)];
      const body = `Hi,\n\nHope you're doing well! Just wanted to touch base on the latest.\n\nBest,\n${sender.displayName || sender.email}`;

      const { data: msg, error } = await supabase.from('Message').insert({
        workspaceId: 'ws_voxora_main', fromMailboxId: sender.id,
        toMailboxId: recip.id, toEmail: recip.email,
        subject: `${subj} [warmup]`, body,
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
          message: `${sender.email} → ${recip.email}`,
        }),
      ]);
      fetchAll();
      alert(`🔥 Warmup sent!\n\n${sender.email}\n↓\n${recip.email}`);
    } catch (err) { alert(`❌ ${err.message}`); }
    finally { setLoading(false); }
  }

  // Stats
  const active = mailboxes.filter(m => m.status === 'ACTIVE').length;
  const totalSent = mailboxes.reduce((a, m) => a + (m.totalSent || 0), 0);
  const totalRecv = mailboxes.reduce((a, m) => a + (m.totalReceived || 0), 0);
  const avgScore = mailboxes.length ? Math.round(mailboxes.reduce((a, m) => a + (m.warmupScore || 85), 0) / mailboxes.length) : 98;
  const pCount = p => mailboxes.filter(m => m.provider === p).length;

  const filteredMb = mailboxes.filter(m => {
    const sq = q.toLowerCase();
    return (m.email.toLowerCase().includes(sq) || m.provider.toLowerCase().includes(sq)) &&
      (filter === 'ALL' || m.provider === filter);
  });

  // Chart options — Voxora CRM style (very minimal, dark)
  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(10,12,24,0.95)', borderColor: 'rgba(99,102,241,0.3)', borderWidth: 1, titleColor: '#fff', bodyColor: '#94A3B8' },
    },
    scales: {
      x: { ticks: { color: '#334155', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y: { ticks: { color: '#334155', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sent',
        data: [18, 24, 31, 28, 42, 35, totalSent || 48],
        backgroundColor: 'rgba(99,102,241,0.5)',
        borderColor: '#6366F1',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Received',
        data: [14, 20, 26, 24, 37, 30, totalRecv || 41],
        backgroundColor: 'rgba(34,211,238,0.4)',
        borderColor: '#22D3EE',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const funnelData = {
    labels: ['Sent', 'Opened', 'Replied', 'Interested', 'Meetings'],
    datasets: [{
      label: 'Conversion Funnel',
      data: [totalSent || 200, 120, 45, 18, 6],
      backgroundColor: 'rgba(139,92,246,0.45)',
      borderColor: '#8B5CF6',
      borderWidth: 1.5,
      borderRadius: 6,
    }],
  };

  // Marquee telemetry data — VME Mailbox Warmup Engine
  const tele = [
    { label: 'SMTP HEALTH', val: `${avgScore}%`, cls: 'green' },
    { label: 'WARMUP ENGINE', val: 'ACTIVE', cls: 'green' },
    { label: 'DAILY LIMIT', val: `${mailboxes.reduce((a, m) => a + (m.warmupDailyLimit || 20), 0)} EMAILS`, cls: 'cyan' },
    { label: 'REPLY DETECTION', val: 'ONLINE', cls: 'green' },
    { label: 'INBOX WARMUP', val: `${avgScore}%`, cls: 'cyan' },
    { label: 'WARMUP AGENTS', val: `${active} RUNNING`, cls: 'purple' },
    { label: 'SPAM SCORE', val: '0.02% (EXCELLENT)', cls: 'green' },
    { label: 'DOMAINS ACTIVE', val: `${domains.length || 0}`, cls: 'cyan' },
    { label: 'MAILBOXES', val: `${mailboxes.length} TOTAL`, cls: 'purple' },
    { label: 'IMAP SYNC', val: 'CONNECTED', cls: 'green' },
  ];

  // Sidebar nav definition
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mailboxes', label: 'Mailboxes', icon: Mail },
    { id: 'dispatch', label: 'Dispatch Log', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'domains', label: 'Domains', icon: Globe },
  ];

  const SYS = [
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'automations', label: 'Automations', icon: Radio },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="app-root">
      <StarCanvas className="star-canvas" />

      {/* ── MARQUEE ── */}
      <div className="marquee-bar">
        <div className="marquee-track">
          {[...tele, ...tele].map((t, i) => (
            <div key={i} className="marquee-item">
              <span>/// {t.label}:</span>
              <span className={`val ${t.cls}`}>&nbsp;{t.val} &nbsp;</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="body-row">

        {/* SIDEBAR */}
        <aside className="sidebar">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-gem">V</div>
            <div>
              <div className="logo-name">VME</div>
              <div className="logo-sub">Vox Mail Engine</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="nav-group-label">Navigation</div>
          {NAV.map(({ id, label, icon: Icon }) => (
            <div key={id} className={`nav-item ${nav === id ? 'active' : ''}`} onClick={() => setNav(id)}>
              <Icon size={15} strokeWidth={1.8} />
              <span>{label}</span>
            </div>
          ))}

          <div className="nav-group-label">System</div>
          {SYS.map(({ id, label, icon: Icon }) => (
            <div key={id} className={`nav-item ${nav === id ? 'active' : ''}`} onClick={() => setNav(id)}>
              <Icon size={15} strokeWidth={1.8} />
              <span>{label}</span>
            </div>
          ))}

          <div className="sidebar-spacer" />

          <div className="sidebar-user">
            <div className="user-ava">V</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>Admin</div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-3)' }}>VME Workspace</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main-area">
          {/* HEADER */}
          <header className="top-header">
            <div className="header-left">
              <span className="header-title">Warmup Command Center</span>
              <div className="campaign-pill">
                <span className="campaign-dot" />
                {mailboxes.length} Mailboxes · {active} Active
                <ChevronDown size={12} />
              </div>
            </div>
            <div className="header-right">
              <button className="icon-btn" onClick={fetchAll} title="Refresh">
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
              </button>
              <button className="icon-btn" title="Notifications">
                <Bell size={14} />
              </button>
              <button className="icon-btn" onClick={() => setCmdK(true)} title="Command Palette ⌘K">
                <Command size={14} />
              </button>
              <div className="agents-badge" onClick={fireWarmup}>
                <span className="agents-dot" />
                {active} Agents Running
              </div>
            </div>
          </header>

          {/* PAGE */}
          <div className="page-scroll">
            <AnimatePresence mode="wait">
              <motion.div
                key={nav}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >

                {/* ══════ DASHBOARD ══════ */}
                {nav === 'dashboard' && (
                  <>
                    {/* HERO */}
                    <div className="hero-card">
                      <HeroCanvas />
                      <div className="hero-content">
                        <div className="hero-eyebrow">— Mailbox Warmup Engine —</div>
                        <div className="hero-title">Your Inboxes, <span className="hl">Warmed Up</span></div>
                        <p className="hero-desc">
                          Automated warmup at scale. Every mailbox connected, every send tracked, every <br />
                          inbox score optimized — all running silently in the background.
                        </p>
                        <div className="hero-pills">
                          <div className="hero-pill">
                            <span className="pill-dot" style={{ background: 'var(--emerald)' }} />
                            WARMUP ACTIVE
                          </div>
                          <div className="hero-pill">
                            <span className="pill-dot" style={{ background: '#818CF8' }} />
                            {mailboxes.length} INBOXES CONNECTED
                          </div>
                          <div className="hero-pill">
                            <span className="pill-dot" style={{ background: 'var(--cyan)' }} />
                            SMTP ENGINE LIVE
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* METRIC CARDS */}
                    <div className="metrics-row">
                      {[
                        {
                          label: 'Total Mailboxes', val: mailboxes.length,
                          sub: <><span className="msub-purple">{active} active</span> in pipeline</>,
                          icon: Mail, iconBg: 'rgba(99,102,241,0.14)', iconColor: '#818CF8',
                        },
                        {
                          label: 'Emails Sent', val: totalSent,
                          sub: <><span className="msub-green">Delivered</span> across {mailboxes.length} inboxes</>,
                          icon: Zap, iconBg: 'rgba(34,211,238,0.12)', iconColor: '#22D3EE',
                        },
                        {
                          label: 'Reply Rate', val: 0,
                          sub: <><span style={{ color: 'var(--text-3)' }}>0 replies</span></>,
                          icon: TrendingUp, iconBg: 'rgba(139,92,246,0.12)', iconColor: '#8B5CF6',
                        },
                        {
                          label: 'Follow-Ups', val: 0,
                          sub: <><span className="msub-amber">Running</span> · auto-scheduled</>,
                          icon: Radio, iconBg: 'rgba(245,158,11,0.12)', iconColor: '#FBBF24',
                        },
                      ].map((m, i) => (
                        <Card key={i} className="metric-card">
                          <div className="metric-top">
                            <span className="metric-label">{m.label}</span>
                            <div className="metric-icon" style={{ background: m.iconBg }}>
                              <m.icon size={16} color={m.iconColor} strokeWidth={1.8} />
                            </div>
                          </div>
                          <div className="metric-num"><Counter val={m.val} /></div>
                          <div className="metric-sub">{m.sub}</div>
                        </Card>
                      ))}
                    </div>

                    {/* BOTTOM ROW */}
                    <div className="bottom-row">
                      {/* Global Outreach Matrix */}
                      <Card className="chart-card">
                        <div className="card-label">Global Outreach Matrix</div>
                        <div className="card-sublabel">Live signal — emails in flight across the world</div>
                        <div className="world-map-wrap">
                          <WorldMapCanvas />
                        </div>
                      </Card>

                      {/* Conversion Funnel */}
                      <Card className="chart-card">
                        <div className="card-label">Conversion Funnel</div>
                        <div className="card-sublabel">Lead journey from first touch to meeting booked</div>
                        <div style={{ height: 170 }}>
                          <Bar data={funnelData} options={chartOpts} />
                        </div>
                      </Card>

                      {/* AI Agents */}
                      <Card className="chart-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div className="card-label">AI Agents</div>
                          <span className="badge badge-active"><span className="badge-dot" />ONLINE</span>
                        </div>
                        <div className="card-sublabel">Monitoring {mailboxes.length} SMTP inboxes</div>

                        {[
                          { name: 'Reply Detection', sub: `Monitoring ${mailboxes.length} SMTP inboxes`, status: 'live', color: '#6366F1' },
                          { name: 'Follow-up Engine', sub: 'Next run: 9:00 AM — auto-schedule', status: 'queued', color: '#F59E0B' },
                          { name: 'Archive Cleaner', sub: `Day ${new Date().getDate()} — auto-archive`, status: 'live', color: '#10B981' },
                        ].map((ag, i) => (
                          <div key={i} className="agent-row">
                            <div className="agent-icon" style={{ background: `${ag.color}1A` }}>
                              <Bot size={14} color={ag.color} strokeWidth={1.8} />
                            </div>
                            <div className="agent-info">
                              <div className="agent-name">{ag.name}</div>
                              <div className="agent-sub">{ag.sub}</div>
                            </div>
                            <span className={`badge badge-${ag.status}`}>{ag.status.toUpperCase()}</span>
                          </div>
                        ))}
                      </Card>
                    </div>
                  </>
                )}

                {/* ══════ MAILBOXES ══════ */}
                {nav === 'mailboxes' && (
                  <Card>
                    <div className="tcard-header">
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>Mailbox Network</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{filteredMb.length} mailboxes — full management</div>
                      </div>
                      <button className="btn btn-primary" onClick={() => setAddMb(true)}>
                        <Plus size={13} /> Add Mailbox
                      </button>
                    </div>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-1)', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div className="filter-tabs">
                        {['ALL', 'ZOHO', 'GMAIL', 'OUTLOOK', 'CUSTOM'].map(p => (
                          <button key={p} className={`ftab ${filter === p ? 'on' : ''}`} onClick={() => setFilter(p)}>
                            {p} {p !== 'ALL' && `(${pCount(p)})`}
                          </button>
                        ))}
                      </div>
                      <div style={{ marginLeft: 'auto', position: 'relative' }}>
                        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                        <input
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', borderRadius: 8, padding: '7px 12px 7px 30px', color: '#fff', fontSize: 12.5, outline: 'none', width: 200, fontFamily: 'var(--font)' }}
                          placeholder="Search…"
                          value={q}
                          onChange={e => setQ(e.target.value)}
                        />
                      </div>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr><th>Email</th><th>Provider</th><th>SMTP Host</th><th>Limit</th><th>Sent</th><th>Received</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {filteredMb.map(item => (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 600 }}>{item.email}</td>
                            <td><span className={`badge badge-${item.provider.toLowerCase()}`}>{item.provider}</span></td>
                            <td style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{item.smtpHost}</td>
                            <td style={{ color: 'var(--text-2)' }}>{item.warmupDailyLimit}/day</td>
                            <td style={{ color: 'var(--text-2)' }}>{item.totalSent || 0}</td>
                            <td style={{ color: 'var(--text-2)' }}>{item.totalReceived || 0}</td>
                            <td><span className={`badge ${item.status === 'ACTIVE' ? 'badge-active' : 'badge-paused'}`}>{item.status}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: 5 }}>
                                <button className={`btn ${item.status === 'ACTIVE' ? 'btn-warn' : 'btn-success'}`} style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => toggleMb(item)}>
                                  {item.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                                </button>
                                <button className="btn btn-danger" style={{ padding: '5px 8px' }} onClick={() => deleteMb(item)}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                )}

                {/* ══════ DISPATCH LOG ══════ */}
                {nav === 'dispatch' && (
                  <Card>
                    <div className="tcard-header">
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>Dispatch Log</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{messages.length} warmup events logged</div>
                      </div>
                      <button className="btn btn-primary" onClick={fireWarmup}><Play size={13} /> Fire Warmup</button>
                    </div>
                    <table className="data-table">
                      <thead><tr><th>Time</th><th>Sender</th><th>Recipient</th><th>Subject</th><th>Status</th><th>View</th></tr></thead>
                      <tbody>
                        {messages.map(msg => {
                          const snd = mailboxes.find(m => m.id === msg.fromMailboxId);
                          const rcv = mailboxes.find(m => m.id === msg.toMailboxId);
                          return (
                            <tr key={msg.id}>
                              <td style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{new Date(msg.createdAt).toLocaleTimeString()}</td>
                              <td>
                                <span style={{ fontWeight: 600 }}>{snd?.email || '—'}</span>
                                {snd && <span className={`badge badge-${snd.provider.toLowerCase()}`} style={{ marginLeft: 6 }}>{snd.provider}</span>}
                              </td>
                              <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{msg.toEmail}</td>
                              <td style={{ color: 'var(--text-2)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</td>
                              <td><span className="badge badge-active">{msg.status}</span></td>
                              <td>
                                <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelMsg({ ...msg, snd, rcv })}>
                                  <Eye size={11} /> View
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Card>
                )}

                {/* ══════ ANALYTICS ══════ */}
                {nav === 'analytics' && (
                  <>
                    <div className="analytics-hero">
                      <div className="sec-title">Advanced Analytics</div>
                      <div className="sec-sub">Next-dimension data visualization for your B2B machine</div>
                    </div>

                    <Card className="chart-card" style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>⚡ Niche A/B Warfare</span>
                      </div>
                      <div className="card-sublabel">Compare performance and conversion velocity across your target niches</div>
                      <div style={{ height: 220 }}>
                        <Bar data={barData} options={{
                          ...chartOpts,
                          plugins: {
                            ...chartOpts.plugins,
                            legend: { labels: { color: '#475569', font: { size: 11 }, boxWidth: 10 } }
                          }
                        }} />
                      </div>
                    </Card>

                    <Card className="chart-card" style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>🎯 Reply Attribution Matrix (مصدر الردود)</span>
                      </div>
                      <div className="card-sublabel">Exact breakdown of which email touchpoint triggered client replies across your campaigns</div>
                      <div style={{ height: 200 }}>
                        <Bar
                          data={{
                            labels: ['Email #1 Cold', 'Email #2 FU', 'Email #3 Value', 'Email #4 Break', 'Email #5 Close'],
                            datasets: [{
                              label: 'Replies Generated',
                              data: [3, 8, 14, 6, 2],
                              backgroundColor: 'rgba(139,92,246,0.45)',
                              borderColor: '#8B5CF6',
                              borderWidth: 1.5,
                              borderRadius: 6,
                            }]
                          }}
                          options={chartOpts}
                        />
                      </div>
                    </Card>

                    <div className="g2">
                      <Card className="chart-card">
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>📊 Provider Distribution</div>
                        <div className="card-sublabel">Pool balance across email providers</div>
                        <div style={{ height: 180 }}>
                          <Doughnut
                            data={{
                              labels: ['Zoho', 'Gmail', 'Outlook', 'Custom'],
                              datasets: [{
                                data: [pCount('ZOHO') || 45, pCount('GMAIL') || 0, pCount('OUTLOOK') || 0, pCount('CUSTOM') || 0],
                                backgroundColor: ['#6366F1', '#F43F5E', '#22D3EE', '#10B981'],
                                borderWidth: 0,
                              }]
                            }}
                            options={{
                              responsive: true, maintainAspectRatio: false,
                              plugins: { legend: { position: 'right', labels: { color: '#475569', font: { size: 10 }, padding: 10 } } }
                            }}
                          />
                        </div>
                      </Card>

                      <Card className="chart-card">
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>📈 Deliverability Health</div>
                        <div className="card-sublabel">6-month warmup trajectory</div>
                        <div style={{ height: 180 }}>
                          <Line
                            data={{
                              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                              datasets: [{
                                label: 'Health',
                                data: [72, 78, 82, 88, 91, avgScore],
                                borderColor: '#10B981',
                                backgroundColor: 'rgba(16,185,129,0.08)',
                                borderWidth: 2,
                                fill: true,
                                tension: 0.45,
                                pointRadius: 3,
                                pointBackgroundColor: '#10B981',
                              }]
                            }}
                            options={chartOpts}
                          />
                        </div>
                      </Card>
                    </div>
                  </>
                )}

                {/* ══════ INBOX ══════ */}
                {nav === 'inbox' && (
                  <Card>
                    <div className="tcard-header">
                      <div style={{ fontSize: 15, fontWeight: 700 }}>Inbox</div>
                    </div>
                    <div style={{ padding: 60, textAlign: 'center' }}>
                      <Inbox size={48} color="var(--accent-purple)" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.6 }} />
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Inbox Monitor</div>
                      <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Real-time incoming warmup replies will appear here</div>
                    </div>
                  </Card>
                )}

                {/* ══════ DOMAINS ══════ */}
                {nav === 'domains' && (
                  <Card>
                    <div className="tcard-header">
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>Domain Infrastructure</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>SPF · DKIM · DMARC · MX diagnostics</div>
                      </div>
                      <button className="btn btn-primary" onClick={() => setAddDom(true)}><Plus size={13} /> Add Domain</button>
                    </div>
                    <table className="data-table">
                      <thead><tr><th>Domain</th><th>Status</th><th>SPF</th><th>DKIM</th><th>DMARC</th><th>MX</th><th>Diagnostics</th></tr></thead>
                      <tbody>
                        {domains.map(d => (
                          <tr key={d.id}>
                            <td style={{ fontWeight: 700 }}>{d.domain || d.name}</td>
                            <td><span className="badge badge-active">ACTIVE</span></td>
                            <td style={{ color: '#34D399', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>v=spf1 PASS</td>
                            <td style={{ color: '#34D399', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>2048-bit PASS</td>
                            <td style={{ color: '#34D399', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>p=reject PASS</td>
                            <td style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>mx.zoho.com</td>
                            <td>
                              <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setDnsMod(d)}>
                                <ShieldCheck size={11} /> Run
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                )}

                {/* ══════ AI AGENTS ══════ */}
                {nav === 'agents' && (
                  <div className="g3">
                    {[
                      { name: 'Reply Detection', desc: 'Monitors all SMTP inboxes for warmup replies in real-time.', status: 'live', color: '#6366F1' },
                      { name: 'Follow-up Engine', desc: 'Schedules and fires follow-up sequences automatically.', status: 'queued', color: '#F59E0B' },
                      { name: 'Archive Cleaner', desc: 'Keeps warmup email threads organized and archived.', status: 'live', color: '#10B981' },
                    ].map((ag, i) => (
                      <Card key={i} style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: `${ag.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={20} color={ag.color} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{ag.name}</div>
                            <span className={`badge badge-${ag.status}`}>{ag.status.toUpperCase()}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{ag.desc}</p>
                      </Card>
                    ))}
                  </div>
                )}

                {/* ══════ AUTOMATIONS ══════ */}
                {nav === 'automations' && (
                  <Card>
                    <div className="tcard-header">
                      <div style={{ fontSize: 15, fontWeight: 700 }}>Automations</div>
                    </div>
                    <div style={{ padding: 60, textAlign: 'center' }}>
                      <Radio size={48} color="var(--accent-cyan)" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.6 }} />
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Automation Engine</div>
                      <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>Configure multi-step outreach sequences and automation rules</div>
                      <button className="btn btn-primary" style={{ margin: '0 auto', display: 'flex' }}>Coming Soon</button>
                    </div>
                  </Card>
                )}

                {/* ══════ SETTINGS — matches Voxora CRM settings page ══════ */}
                {nav === 'settings' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, gap: 16 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: 20,
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 8,
                      boxShadow: '0 0 30px rgba(99,102,241,0.2)'
                    }}>
                      <Settings size={32} color="#818CF8" />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Settings</div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-2)', textAlign: 'center', maxWidth: 300, lineHeight: 1.65 }}>
                      Manage your account, connected inboxes, API keys, and team members.
                    </div>
                    <button className="btn btn-ghost" style={{ padding: '10px 24px', fontSize: 13 }}>Coming Soon</button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MODALS
         ══════════════════════════════════════ */}

      {/* ⌘K Command Palette */}
      <AnimatePresence>
        {cmdK && (
          <motion.div className="cmdk-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCmdK(false)}>
            <motion.div className="cmdk-panel" initial={{ scale: 0.95, y: -12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -12 }} onClick={e => e.stopPropagation()}>
              <div className="cmdk-search">
                <Search size={16} color="var(--text-3)" />
                <input autoFocus placeholder="Search commands…" />
                <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 5, padding: '2px 7px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>ESC</span>
              </div>
              <div style={{ padding: '6px 0' }}>
                {[
                  { label: 'Fire Warmup Exchange', icon: Play, color: '#22D3EE', fn: () => { fireWarmup(); setCmdK(false); } },
                  { label: 'Add Mailbox', icon: Plus, color: '#10B981', fn: () => { setAddMb(true); setCmdK(false); } },
                  { label: 'Add Domain', icon: Globe, color: '#8B5CF6', fn: () => { setAddDom(true); setCmdK(false); } },
                  { label: 'Dispatch Log', icon: Zap, color: '#F59E0B', fn: () => { setNav('dispatch'); setCmdK(false); } },
                  { label: 'Refresh Data', icon: RefreshCw, color: '#6366F1', fn: () => { fetchAll(); setCmdK(false); } },
                ].map((c, i) => (
                  <div key={i} className="cmdk-cmd" onClick={c.fn}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                      <c.icon size={15} color={c.color} />
                      <span>{c.label}</span>
                    </div>
                    <ArrowUpRight size={13} color="var(--text-3)" />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Inspector */}
      <AnimatePresence>
        {selMsg && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelMsg(null)}>
            <motion.div className="modal-box" initial={{ scale: 0.95, y: -14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -14 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Message Inspector</h2>
                <X size={18} style={{ cursor: 'pointer', color: 'var(--text-3)' }} onClick={() => setSelMsg(null)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border-1)' }}>
                {[['Sender', selMsg.snd?.email || '—', selMsg.snd?.provider], ['Recipient', selMsg.toEmail, selMsg.rcv?.provider], ['Subject', selMsg.subject, null]].map(([k, v, prov], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                    <div style={{ fontWeight: 600, color: i === 1 ? 'var(--accent-cyan)' : 'var(--text-1)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      {v}
                      {prov && <span className={`badge badge-${prov.toLowerCase()}`}>{prov}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 8 }}>Email Body</div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 10, padding: 16, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 180, overflowY: 'auto' }}>
                {selMsg.body}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DNS Modal */}
      <AnimatePresence>
        {dnsMod && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDnsMod(null)}>
            <motion.div className="modal-box" initial={{ scale: 0.95, y: -14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -14 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>DNS Diagnostics: {dnsMod.domain || dnsMod.name}</h2>
                <X size={18} style={{ cursor: 'pointer', color: 'var(--text-3)' }} onClick={() => setDnsMod(null)} />
              </div>
              {[
                { label: 'SPF RECORD', val: 'v=spf1 include:zoho.com ~all', c: '#10B981', b: 'rgba(16,185,129,0.2)' },
                { label: 'DKIM SIGNATURE', val: 'Selector: zoho._domainkey • 2048-bit RSA', c: '#818CF8', b: 'rgba(99,102,241,0.15)' },
                { label: 'DMARC POLICY', val: `v=DMARC1; p=reject; rua=mailto:dmarc@${dnsMod.domain}`, c: '#22D3EE', b: 'rgba(34,211,238,0.12)' },
                { label: 'MX RECORDS', val: 'mx.zoho.com (Priority 10)', c: '#10B981', b: 'rgba(16,185,129,0.12)' },
              ].map((r, i) => (
                <div key={i} style={{ background: r.b, border: `1px solid ${r.c}44`, borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: r.c, letterSpacing: '0.12em', marginBottom: 5 }}>{r.label} (PASS)</div>
                  <div style={{ fontSize: 12.5, color: '#fff', fontFamily: 'var(--font-mono)' }}>{r.val}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Mailbox Modal */}
      <AnimatePresence>
        {addMb && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddMb(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.95, y: -14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -14 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Add Warmup Mailbox</h2>
                <X size={18} style={{ cursor: 'pointer', color: 'var(--text-3)' }} onClick={() => setAddMb(false)} />
              </div>
              <form onSubmit={submitMailbox} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-field">
                  <label className="form-label">Provider</label>
                  <select value={mb.provider} onChange={e => setProvider(e.target.value)}>
                    <option value="ZOHO">Zoho Mail</option>
                    <option value="GMAIL">Gmail / Google Workspace</option>
                    <option value="OUTLOOK">Microsoft Outlook</option>
                    <option value="MICROSOFT365">Microsoft 365</option>
                    <option value="CUSTOM">Custom SMTP / IMAP</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Email Address</label>
                  <input type="email" required placeholder="you@yourdomain.com" value={mb.email} onChange={e => setMb(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                  <div className="form-field">
                    <label className="form-label">SMTP Host</label>
                    <input required value={mb.smtpHost} onChange={e => setMb(p => ({ ...p, smtpHost: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Port</label>
                    <input type="number" required value={mb.smtpPort} onChange={e => setMb(p => ({ ...p, smtpPort: e.target.value }))} />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">App Password</label>
                  <input type="password" required placeholder="••••••••••••" value={mb.smtpPassword} onChange={e => setMb(p => ({ ...p, smtpPassword: e.target.value, imapPassword: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Daily Warmup Limit</label>
                  <input type="number" value={mb.warmupDailyLimit} onChange={e => setMb(p => ({ ...p, warmupDailyLimit: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '11px', justifyContent: 'center', fontSize: 13.5, marginTop: 6 }}>
                  Connect to Network
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Domain Modal */}
      <AnimatePresence>
        {addDom && (
          <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddDom(false)}>
            <motion.div className="modal-box" style={{ width: 420 }} initial={{ scale: 0.95, y: -14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -14 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Add Domain</h2>
                <X size={18} style={{ cursor: 'pointer', color: 'var(--text-3)' }} onClick={() => setAddDom(false)} />
              </div>
              <form onSubmit={submitDomain} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-field">
                  <label className="form-label">Domain Name</label>
                  <input required placeholder="yourdomain.work" value={dom} onChange={e => setDom(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '11px', justifyContent: 'center', fontSize: 13.5 }}>
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
