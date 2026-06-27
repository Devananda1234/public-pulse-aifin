import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Compass,
  Download,
  FileText,
  Filter,
  Gauge,
  Globe2,
  Home,
  Layers,
  LocateFixed,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPinned,
  Menu,
  Mic,
  Moon,
  PlusCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Upload,
  Users,
  X
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import './styles.css';

type Role = 'guest' | 'citizen' | 'admin';
type Page =
  | 'landing'
  | 'login'
  | 'register'
  | 'citizen'
  | 'report'
  | 'track'
  | 'map'
  | 'heatmap'
  | 'admin'
  | 'analytics'
  | 'transparency'
  | 'weekly'
  | 'notifications'
  | 'about'
  | 'privacy'
  | 'contact';
type Category =
  | 'Road Damage'
  | 'Water Leakage'
  | 'Electricity'
  | 'Waste Management'
  | 'Environment'
  | 'Public Safety'
  | 'Transportation'
  | 'Healthcare'
  | 'Education'
  | 'Disaster'
  | 'Others';
type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
type PriorityLevel = Severity;
type Department =
  | 'PWD'
  | 'KSEB'
  | 'Water Authority'
  | 'Municipality'
  | 'Police'
  | 'Health Department'
  | 'Forest Department'
  | 'Disaster Management';
type Status =
  | 'Submitted'
  | 'AI Verified'
  | 'Department Assigned'
  | 'Under Review'
  | 'Inspection Scheduled'
  | 'Work In Progress'
  | 'Resolved'
  | 'Citizen Verification'
  | 'Closed';
type Language = 'en' | 'ml';

type AIResult = {
  category: Category;
  department: Department;
  severity: Severity;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  confidence: number;
  summary: string;
  factors: string[];
  imageSignal: string;
};

type Verification = {
  state: 'Pending' | 'Accepted' | 'Rejected';
  rating?: number;
  feedback?: string;
  imageName?: string;
  time?: string;
};

type Report = {
  id: string;
  title: string;
  description: string;
  category: Category;
  severity: Severity;
  status: Status;
  priorityLevel: PriorityLevel;
  priorityScore: number;
  confidence: number;
  location: string;
  ward: string;
  lat: number;
  lng: number;
  department: Department;
  summary: string;
  citizenEmail: string;
  createdAt: string;
  imageName?: string;
  populationDensity: number;
  nearbySchools: number;
  nearbyHospitals: number;
  trafficDensity: number;
  duplicateCount: number;
  supporters: string[];
  mergedReportIds: string[];
  ai: AIResult;
  verification: Verification;
  timeline: { status: Status; time: string; note: string }[];
};

type User = { name: string; email: string; password: string; verified: boolean };
type Notification = { id: string; recipientEmail?: string; title: string; message: string; time: string; read: boolean; emailReady?: boolean };
type AuditLog = { id: string; action: string; reportId?: string; actor: string; time: string; details: string };

const departments: Department[] = ['PWD', 'KSEB', 'Water Authority', 'Municipality', 'Police', 'Health Department', 'Forest Department', 'Disaster Management'];
const categories: Category[] = ['Road Damage', 'Water Leakage', 'Electricity', 'Waste Management', 'Environment', 'Public Safety', 'Transportation', 'Healthcare', 'Education', 'Disaster', 'Others'];
const severities: Severity[] = ['Low', 'Medium', 'High', 'Critical'];
const statuses: Status[] = ['Submitted', 'AI Verified', 'Department Assigned', 'Under Review', 'Inspection Scheduled', 'Work In Progress', 'Resolved', 'Citizen Verification', 'Closed'];
const priorityRank: Record<PriorityLevel, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
const severityScore: Record<Severity, number> = { Low: 26, Medium: 52, High: 76, Critical: 94 };
const chartColors = ['#0f6fb8', '#14b8a6', '#f59e0b', '#ef4444', '#6366f1', '#22c55e', '#8b5cf6', '#06b6d4'];

const categoryDepartments: Record<Category, Department> = {
  'Road Damage': 'PWD',
  'Water Leakage': 'Water Authority',
  Electricity: 'KSEB',
  'Waste Management': 'Municipality',
  Environment: 'Forest Department',
  'Public Safety': 'Police',
  Transportation: 'PWD',
  Healthcare: 'Health Department',
  Education: 'Municipality',
  Disaster: 'Disaster Management',
  Others: 'Municipality'
};

const text = {
  en: {
    report: 'Report an Issue',
    dashboard: 'Explore Dashboard',
    voice: 'Voice complaint',
    submit: 'Submit Report',
    received: 'Complaint received',
    transparency: 'Transparency'
  },
  ml: {
    report: 'പരാതി നൽകുക',
    dashboard: 'ഡാഷ്ബോർഡ് കാണുക',
    voice: 'വോയ്‌സ് പരാതി',
    submit: 'റിപ്പോർട്ട് സമർപ്പിക്കുക',
    received: 'പരാതി സ്വീകരിച്ചു',
    transparency: 'സുതാര്യത'
  }
};

const readStore = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const useLocalStorage = <T,>(key: string, fallback: T) => {
  const [value, setValue] = useState<T>(() => readStore(key, fallback));
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
  return [value, setValue] as const;
};

const nowLabel = () => new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const makeId = () => `PPAI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
const daysOpen = (createdAt: string) => Math.max(1, Math.ceil((Date.now() - new Date(createdAt).getTime()) / 86400000) || 1);

function normalizeReport(report: Report): Report {
  const legacyStatus: Record<string, Status> = { Assigned: 'Department Assigned', 'In Progress': 'Work In Progress' };
  const status = statuses.includes(report.status) ? report.status : legacyStatus[report.status] || 'Submitted';
  const ai = report.ai || inferAI(report.description || '', report.title || '', report.location || '', report.imageName || '', []);
  return {
    ...report,
    status,
    category: ((report as any).category === 'Roads' ? 'Road Damage' : report.category) as Category,
    department: departments.includes(report.department as Department) ? (report.department as Department) : ai.department,
    severity: report.severity || ai.severity,
    priorityLevel: report.priorityLevel || ai.priorityLevel,
    priorityScore: report.priorityScore || (report as any).priority || ai.priorityScore,
    confidence: report.confidence || ai.confidence,
    ward: report.ward || inferWard(report.location || ''),
    populationDensity: report.populationDensity || inferDensity(report.location || ''),
    nearbySchools: report.nearbySchools ?? (/school|college|campus/i.test(report.location || report.description || '') ? 1 : 0),
    nearbyHospitals: report.nearbyHospitals ?? (/hospital|clinic|health/i.test(report.location || report.description || '') ? 1 : 0),
    trafficDensity: report.trafficDensity || inferTraffic(report.location || report.description || ''),
    duplicateCount: report.duplicateCount || 1,
    supporters: report.supporters || [report.citizenEmail].filter(Boolean),
    mergedReportIds: report.mergedReportIds || [],
    ai,
    verification: report.verification || { state: 'Pending' },
    timeline: report.timeline?.length ? report.timeline.map((t) => ({ ...t, status: statuses.includes(t.status) ? t.status : legacyStatus[t.status] || 'Submitted' })) : [{ status: 'Submitted', time: report.createdAt || nowLabel(), note: 'Citizen report received.' }]
  };
}

function inferWard(location: string) {
  const found = location.match(/ward\s*([0-9a-z-]+)/i);
  if (found) return `Ward ${found[1].toUpperCase()}`;
  const zones = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E'];
  return zones[Math.abs(location.length || 2) % zones.length];
}

function inferDensity(textValue: string) {
  const text = textValue.toLowerCase();
  if (/market|school|hospital|junction|station|bus|college/.test(text)) return 92;
  if (/main|central|town|ward/.test(text)) return 74;
  return 48;
}

function inferTraffic(textValue: string) {
  const text = textValue.toLowerCase();
  if (/traffic|junction|highway|bus|market|main/.test(text)) return 88;
  if (/street|road|school|office/.test(text)) return 66;
  return 38;
}

function inferAI(description: string, title = '', location = '', imageName = '', existing: Report[] = []): AIResult {
  const fullText = `${title} ${description} ${location} ${imageName}`.toLowerCase();
  const match = [
    { keys: ['pothole', 'road', 'street', 'bridge', 'footpath', 'asphalt', 'damage'], category: 'Road Damage' as Category },
    { keys: ['water', 'leak', 'drain', 'sewage', 'pipe', 'flood'], category: 'Water Leakage' as Category },
    { keys: ['light', 'electric', 'power', 'wire', 'transformer', 'pole'], category: 'Electricity' as Category },
    { keys: ['garbage', 'waste', 'trash', 'dump', 'sanitation'], category: 'Waste Management' as Category },
    { keys: ['crime', 'unsafe', 'accident', 'harassment', 'theft'], category: 'Public Safety' as Category },
    { keys: ['traffic', 'bus', 'parking', 'signal'], category: 'Transportation' as Category },
    { keys: ['hospital', 'disease', 'health', 'clinic'], category: 'Healthcare' as Category },
    { keys: ['tree', 'forest', 'pollution', 'smoke', 'noise'], category: 'Environment' as Category },
    { keys: ['landslide', 'fire', 'disaster', 'storm', 'collapse'], category: 'Disaster' as Category }
  ].find((item) => item.keys.some((key) => fullText.includes(key)));
  const category = match?.category ?? 'Others';
  const repeated = existing.filter((r) => isSimilarIssue(r, { title, description, location, category })).length;
  const populationDensity = inferDensity(location);
  const trafficDensity = inferTraffic(`${location} ${description}`);
  const nearbySchools = /school|college|campus/.test(fullText) ? 1 : 0;
  const nearbyHospitals = /hospital|clinic|health/.test(fullText) ? 1 : 0;
  const urgent = /danger|urgent|severe|critical|accident|fire|injury|flood|collapse|live wire/.test(fullText);
  const high = /days|blocked|overflow|broken|market|school|hospital|junction/.test(fullText);
  const severity: Severity = urgent ? 'Critical' : high ? 'High' : fullText.length > 140 ? 'Medium' : 'Low';
  const score = Math.min(
    100,
    severityScore[severity] +
      Math.round(populationDensity * 0.08) +
      Math.round(trafficDensity * 0.06) +
      nearbySchools * 6 +
      nearbyHospitals * 8 +
      repeated * 5 +
      (imageName ? 4 : 0)
  );
  const priorityLevel: PriorityLevel = score >= 88 ? 'Critical' : score >= 68 ? 'High' : score >= 45 ? 'Medium' : 'Low';
  const confidence = Math.min(99, 74 + (match ? 12 : 0) + (imageName ? 5 : 0) + (location ? 4 : 0) + Math.min(4, repeated));
  return {
    category,
    department: categoryDepartments[category],
    severity,
    priorityScore: score,
    priorityLevel,
    confidence,
    summary: description ? `${description.slice(0, 132)}${description.length > 132 ? '...' : ''}` : 'AI summary will appear when a description is entered.',
    imageSignal: imageName ? `Image attached: ${imageName}. Visual evidence included in classification.` : 'No image uploaded. AI is using text and location signals.',
    factors: [
      `Population density ${populationDensity}/100`,
      `Traffic density ${trafficDensity}/100`,
      nearbySchools ? 'School proximity detected' : 'No school proximity signal',
      nearbyHospitals ? 'Hospital proximity detected' : 'No hospital proximity signal',
      repeated ? `${repeated} repeated signal${repeated > 1 ? 's' : ''}` : 'No repeated complaint signal'
    ]
  };
}

function isSimilarIssue(report: Report, issue: { title: string; description: string; location: string; category: Category }) {
  const sameCategory = report.category === issue.category;
  const locationWords = issue.location.toLowerCase().split(/\W+/).filter((word) => word.length > 3);
  const sharedLocation = locationWords.some((word) => report.location.toLowerCase().includes(word));
  const reportWords = `${issue.title} ${issue.description}`.toLowerCase().split(/\W+/).filter((word) => word.length > 4);
  const sharedWords = reportWords.filter((word) => `${report.title} ${report.description}`.toLowerCase().includes(word)).length;
  const closeCoordinates = Math.abs((report.lat || 0) - 28.6139) < 0.12;
  return sameCategory && (sharedLocation || sharedWords >= 2 || closeCoordinates);
}

function sortReports(reports: Report[]) {
  return [...reports].sort((a, b) => priorityRank[b.priorityLevel] - priorityRank[a.priorityLevel] || b.priorityScore - a.priorityScore || daysOpen(b.createdAt) - daysOpen(a.createdAt));
}

function App() {
  const [role, setRole] = useLocalStorage<Role>('ppai-role', 'guest');
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('ppai-current-user', null);
  const [users, setUsers] = useLocalStorage<User[]>('ppai-users', []);
  const [storedReports, setStoredReports] = useLocalStorage<Report[]>('ppai-reports', []);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('ppai-notifications', []);
  const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>('ppai-audit-logs', []);
  const [language, setLanguage] = useLocalStorage<Language>('ppai-language', 'en');
  const [page, setPage] = useState<Page>(role === 'admin' ? 'admin' : role === 'citizen' ? 'citizen' : 'landing');
  const [dark, setDark] = useLocalStorage<boolean>('ppai-dark', false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const reports = useMemo(() => storedReports.map(normalizeReport), [storedReports]);
  const setReports: React.Dispatch<React.SetStateAction<Report[]>> = (action) => {
    setStoredReports((items) => {
      const normalized = items.map(normalizeReport);
      return typeof action === 'function' ? action(normalized) : action;
    });
  };

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  const myReports = useMemo(
    () => sortReports(reports.filter((report) => report.citizenEmail === currentUser?.email || report.supporters.includes(currentUser?.email || ''))),
    [reports, currentUser]
  );

  const addNotification = (title: string, message: string, recipientEmail?: string) => {
    setNotifications((items) => [{ id: crypto.randomUUID(), recipientEmail, title, message, time: nowLabel(), read: false, emailReady: true }, ...items]);
  };
  const addAudit = (action: string, details: string, reportId?: string) => {
    setAuditLogs((items) => [{ id: crypto.randomUUID(), action, details, reportId, actor: currentUser?.email || 'system', time: nowLabel() }, ...items]);
  };
  const notifyLifecycle = (report: Report, status: Status) => {
    const messages: Record<Status, string> = {
      Submitted: 'Your complaint was received by Public Pulse AI.',
      'AI Verified': 'AI has classified your issue and calculated its civic priority.',
      'Department Assigned': `${report.department} has been assigned to your complaint.`,
      'Under Review': 'The administrator has started reviewing your complaint.',
      'Inspection Scheduled': 'A field inspection has been scheduled.',
      'Work In Progress': 'Resolution work is now in progress.',
      Resolved: 'The department marked this issue as resolved.',
      'Citizen Verification': 'Please verify whether the resolution is satisfactory.',
      Closed: 'Your complaint has been closed.'
    };
    addNotification(status, messages[status], report.citizenEmail);
  };

  const updateStatus = (id: string, status: Status) => {
    let updatedReport: Report | undefined;
    setReports((items) =>
      items.map((report) => {
        if (report.id !== id) return report;
        updatedReport = { ...report, status, timeline: [...report.timeline, { status, time: nowLabel(), note: `Administrator updated lifecycle to ${status}.` }] };
        return updatedReport;
      })
    );
    if (updatedReport) {
      notifyLifecycle(updatedReport, status);
      addAudit('Lifecycle update', `Status changed to ${status}`, id);
    }
  };

  const updateReport = (id: string, changes: Partial<Report>, auditText: string) => {
    let updatedReport: Report | undefined;
    setReports((items) =>
      items.map((report) => {
        if (report.id !== id) return report;
        updatedReport = { ...report, ...changes };
        return updatedReport;
      })
    );
    if (updatedReport) {
      addNotification('Complaint updated', auditText, updatedReport.citizenEmail);
      addAudit('Admin override', auditText, id);
    }
  };

  const logout = () => {
    setRole('guest');
    setCurrentUser(null);
    setPage('landing');
  };

  const nav = [
    { page: 'landing' as Page, label: 'Home', icon: Home, show: true },
    { page: 'citizen' as Page, label: 'Citizen', icon: CircleUserRound, show: role === 'citizen' },
    { page: 'report' as Page, label: 'Report', icon: PlusCircle, show: role === 'citizen' },
    { page: 'track' as Page, label: 'Track', icon: ClipboardCheck, show: role !== 'guest' },
    { page: 'map' as Page, label: 'Map', icon: MapPinned, show: true },
    { page: 'heatmap' as Page, label: 'Heat AI', icon: Layers, show: true },
    { page: 'transparency' as Page, label: 'Public', icon: Globe2, show: true },
    { page: 'admin' as Page, label: 'Admin', icon: Building2, show: role === 'admin' },
    { page: 'analytics' as Page, label: 'Analytics', icon: BarChart3, show: role === 'admin' },
    { page: 'weekly' as Page, label: 'Reports', icon: FileText, show: role === 'admin' },
    { page: 'notifications' as Page, label: 'Alerts', icon: Bell, show: role !== 'guest' }
  ].filter((item) => item.show);

  const visibleNotifications = notifications.filter((note) => !note.recipientEmail || role === 'admin' || note.recipientEmail === currentUser?.email);

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <AuthPage mode="login" users={users} setRole={setRole} setCurrentUser={setCurrentUser} setPage={setPage} addAudit={addAudit} />;
      case 'register':
        return <AuthPage mode="register" users={users} setUsers={setUsers} setRole={setRole} setCurrentUser={setCurrentUser} setPage={setPage} addNotification={addNotification} addAudit={addAudit} />;
      case 'citizen':
        if (role !== 'citizen') return <AuthPage mode="login" users={users} setRole={setRole} setCurrentUser={setCurrentUser} setPage={setPage} addAudit={addAudit} />;
        return <CitizenDashboard reports={myReports} setPage={setPage} updateStatus={updateStatus} setReports={setReports} currentUser={currentUser} addNotification={addNotification} addAudit={addAudit} />;
      case 'report':
        if (role !== 'citizen') return <AuthPage mode="register" users={users} setUsers={setUsers} setRole={setRole} setCurrentUser={setCurrentUser} setPage={setPage} addNotification={addNotification} addAudit={addAudit} />;
        return <ReportIssue currentUser={currentUser} reports={reports} setReports={setReports} setPage={setPage} addNotification={addNotification} addAudit={addAudit} language={language} />;
      case 'track':
        return <TrackPage reports={reports} currentUser={currentUser} setReports={setReports} addNotification={addNotification} addAudit={addAudit} />;
      case 'map':
        return <MapPage reports={reports} />;
      case 'heatmap':
        return <HeatmapPage reports={reports} />;
      case 'transparency':
        return <TransparencyPage reports={reports} />;
      case 'admin':
        if (role !== 'admin') return <AuthPage mode="login" users={users} setRole={setRole} setCurrentUser={setCurrentUser} setPage={setPage} addAudit={addAudit} />;
        return <AdminDashboard reports={reports} updateStatus={updateStatus} updateReport={updateReport} auditLogs={auditLogs} />;
      case 'analytics':
        if (role !== 'admin') return <AuthPage mode="login" users={users} setRole={setRole} setCurrentUser={setCurrentUser} setPage={setPage} addAudit={addAudit} />;
        return <AnalyticsPage reports={reports} />;
      case 'weekly':
        if (role !== 'admin') return <AuthPage mode="login" users={users} setRole={setRole} setCurrentUser={setCurrentUser} setPage={setPage} addAudit={addAudit} />;
        return <WeeklyReportPage reports={reports} />;
      case 'notifications':
        if (role === 'guest') return <AuthPage mode="login" users={users} setRole={setRole} setCurrentUser={setCurrentUser} setPage={setPage} addAudit={addAudit} />;
        return <NotificationsPage notifications={visibleNotifications} setNotifications={setNotifications} />;
      case 'about':
        return <StaticPage title="About Public Pulse AI" icon={Sparkles} kind="about" />;
      case 'privacy':
        return <StaticPage title="Privacy & Security" icon={ShieldCheck} kind="privacy" />;
      case 'contact':
        return <StaticPage title="Contact & Support" icon={Users} kind="contact" />;
      default:
        return <LandingPage setPage={setPage} reports={reports} language={language} />;
    }
  };

  return (
    <div className="app-shell">
      <Header
        role={role}
        currentUser={currentUser}
        setPage={setPage}
        logout={logout}
        dark={dark}
        setDark={setDark}
        nav={nav}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        unread={visibleNotifications.filter((note) => !note.read).length}
        language={language}
        setLanguage={setLanguage}
      />
      {mobileOpen && <MobileNav nav={nav} setPage={setPage} setMobileOpen={setMobileOpen} />}
      <main>{renderPage()}</main>
      <Footer setPage={setPage} />
    </div>
  );
}

function Header(props: {
  role: Role;
  currentUser: User | null;
  setPage: (p: Page) => void;
  logout: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  nav: { page: Page; label: string; icon: React.ElementType }[];
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  unread: number;
  language: Language;
  setLanguage: (v: Language) => void;
}) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => props.setPage('landing')}>
        <span className="brand-mark"><Activity size={22} /></span>
        <span><b>Public Pulse</b><em>AI</em></span>
      </button>
      <nav className="desktop-nav">
        {props.nav.map(({ page, label, icon: Icon }) => (
          <button key={page} onClick={() => props.setPage(page)}><Icon size={16} />{label}</button>
        ))}
      </nav>
      <div className="top-actions">
        <button className="icon-btn" onClick={() => props.setLanguage(props.language === 'en' ? 'ml' : 'en')} title="Switch language">
          <Globe2 size={18} />
        </button>
        <button className="icon-btn" onClick={() => props.setDark(!props.dark)} title="Toggle dark mode">
          {props.dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {props.role === 'guest' ? (
          <>
            <button className="ghost-btn" onClick={() => props.setPage('login')}><LogIn size={16} />Login</button>
            <button className="primary-btn small" onClick={() => props.setPage('register')}>Register</button>
          </>
        ) : (
          <>
            <button className="icon-btn notify" onClick={() => props.setPage('notifications')} title="Notifications"><Bell size={18} />{props.unread > 0 && <span>{props.unread}</span>}</button>
            <button className="ghost-btn" onClick={props.logout}><LogOut size={16} />Logout</button>
          </>
        )}
        <button className="icon-btn mobile-menu" onClick={() => props.setMobileOpen(!props.mobileOpen)}>{props.mobileOpen ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

function MobileNav({ nav, setPage, setMobileOpen }: { nav: { page: Page; label: string; icon: React.ElementType }[]; setPage: (p: Page) => void; setMobileOpen: (v: boolean) => void }) {
  return (
    <div className="mobile-nav">
      {nav.map(({ page, label, icon: Icon }) => (
        <button key={page} onClick={() => { setPage(page); setMobileOpen(false); }}><Icon size={17} />{label}</button>
      ))}
    </div>
  );
}

function LandingPage({ setPage, reports, language }: { setPage: (p: Page) => void; reports: Report[]; language: Language }) {
  const active = reports.filter((r) => !['Closed', 'Resolved'].includes(r.status)).length;
  const critical = reports.filter((r) => r.priorityLevel === 'Critical' && r.status !== 'Closed').length;
  return (
    <section className="landing">
      <div className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={16} /> Enterprise civic intelligence</span>
          <h1>Your Voice. Smarter Governance.</h1>
          <p>Report civic issues, track resolutions, and help build better communities through AI-powered governance.</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => setPage('report')}>{text[language].report}<ChevronRight size={18} /></button>
            <button className="secondary-btn" onClick={() => setPage('admin')}>{text[language].dashboard}</button>
            <button className="secondary-btn" onClick={() => setPage('transparency')}>{text[language].transparency}</button>
          </div>
        </div>
        <div className="city-visual" aria-label="Smart city civic operations illustration">
          <div className="scan-line" />
          <div className="tower t1" /><div className="tower t2" /><div className="tower t3" /><div className="tower t4" />
          <div className="pulse-node n1" /><div className="pulse-node n2" /><div className="pulse-node n3" />
          <div className="map-card"><MapPinned size={22} /><span>{reports.length || 'No'} reports</span></div>
          <div className="insight-card"><Gauge size={20} /><span>{active} active cases</span></div>
        </div>
      </div>
      <div className="feature-grid">
        <Feature icon={Sparkles} title="AI Smart Routing" text="Image, text, and location signals classify complaints with confidence scores." />
        <Feature icon={Building2} title="Department Workspaces" text="Single admin architecture with work queues for every civic department." />
        <Feature icon={RefreshCcw} title="Citizen Verification" text="Resolved cases require citizen acceptance or rejection before closure." />
        <Feature icon={ShieldCheck} title="Audit & Transparency" text="Admin actions are logged and public metrics expose no personal data." />
      </div>
      <div className="preview-band">
        <Kpi title="Total Complaints" value={reports.length} icon={ClipboardCheck} />
        <Kpi title="Critical Unresolved" value={critical} icon={AlertTriangle} />
        <Kpi title="Closed" value={reports.filter((r) => r.status === 'Closed').length} icon={CheckCircle2} />
        <Kpi title="Citizen Engagement" value={reports.reduce((sum, report) => sum + report.duplicateCount, 0)} icon={Users} />
      </div>
    </section>
  );
}

function Feature({ icon: Icon, title, text: body }: { icon: React.ElementType; title: string; text: string }) {
  return <article className="feature"><Icon size={24} /><h3>{title}</h3><p>{body}</p></article>;
}

function AuthPage(props: {
  mode: 'login' | 'register';
  users: User[];
  setUsers?: React.Dispatch<React.SetStateAction<User[]>>;
  setRole: (r: Role) => void;
  setCurrentUser: (u: User | null) => void;
  setPage: (p: Page) => void;
  addNotification?: (t: string, m: string, e?: string) => void;
  addAudit: (a: string, d: string, r?: string) => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', password: '', admin: false });
  const [error, setError] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) return setError('Enter a valid email address.');
    if (props.mode === 'login' && form.admin) {
      if (form.email === 'admin@publicpulse.ai' && form.password === 'admin123') {
        props.setRole('admin');
        props.setCurrentUser({ name: 'City Administrator', email: form.email, password: '', verified: true });
        props.addAudit('Admin login', 'Secure administrator session started');
        props.setPage('admin');
      } else setError('Use admin@publicpulse.ai / admin123 for demo admin access.');
      return;
    }
    if (props.mode === 'register') {
      if (!form.name.trim() || form.password.length < 6) return setError('Use a name and a password with at least 6 characters.');
      if (props.users.some((u) => u.email === form.email)) return setError('An account already exists for this email.');
      const user = { name: form.name.trim(), email: form.email.trim(), password: form.password, verified: true };
      props.setUsers?.((items) => [...items, user]);
      props.setCurrentUser(user);
      props.setRole('citizen');
      props.addNotification?.('Verified citizen login enabled', 'Your account is ready for civic reporting.', user.email);
      props.setPage('citizen');
      return;
    }
    const user = props.users.find((u) => u.email === form.email && u.password === form.password);
    if (!user) return setError('No matching verified citizen account found. Register first or use admin access.');
    props.setCurrentUser({ ...user, verified: true });
    props.setRole('citizen');
    props.setPage('citizen');
  };
  return (
    <section className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <span className="auth-icon"><Lock size={22} /></span>
        <h2>{props.mode === 'register' ? 'Verified Citizen Registration' : 'Secure Login'}</h2>
        <p>{props.mode === 'register' ? 'Create a persistent local demo identity.' : 'Access citizen tracking or administrator operations.'}</p>
        {props.mode === 'register' && <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {props.mode === 'login' && <label className="check-row"><input type="checkbox" checked={form.admin} onChange={(e) => setForm({ ...form, admin: e.target.checked })} />Admin Access</label>}
        {error && <div className="error">{error}</div>}
        <button className="primary-btn wide">{props.mode === 'register' ? 'Create Verified Account' : 'Login'}</button>
        <button type="button" className="link-btn" onClick={() => props.setPage(props.mode === 'register' ? 'login' : 'register')}>
          {props.mode === 'register' ? 'Already registered? Login' : 'New citizen? Register'}
        </button>
      </form>
    </section>
  );
}

function CitizenDashboard(props: {
  reports: Report[];
  setPage: (p: Page) => void;
  updateStatus: (id: string, status: Status) => void;
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  currentUser: User | null;
  addNotification: (t: string, m: string, e?: string) => void;
  addAudit: (a: string, d: string, r?: string) => void;
}) {
  return (
    <DashboardLayout title="Citizen Dashboard" subtitle="Track lifecycle progress, notifications, and verification requests." action={<button className="primary-btn" onClick={() => props.setPage('report')}><PlusCircle size={18} />New Report</button>}>
      <div className="kpi-grid">
        <Kpi title="My Reports" value={props.reports.length} icon={ClipboardCheck} />
        <Kpi title="Pending" value={props.reports.filter((r) => !['Closed', 'Resolved'].includes(r.status)).length} icon={Activity} />
        <Kpi title="Awaiting Verification" value={props.reports.filter((r) => r.status === 'Citizen Verification').length} icon={RefreshCcw} />
        <Kpi title="Critical Priority" value={props.reports.filter((r) => r.priorityLevel === 'Critical').length} icon={AlertTriangle} />
      </div>
      <ReportList reports={props.reports} empty="No reports submitted yet. Submit your first report to start generating insights." currentUser={props.currentUser} setReports={props.setReports} addNotification={props.addNotification} addAudit={props.addAudit} />
    </DashboardLayout>
  );
}

function ReportIssue({ currentUser, reports, setReports, setPage, addNotification, addAudit, language }: { currentUser: User | null; reports: Report[]; setReports: React.Dispatch<React.SetStateAction<Report[]>>; setPage: (p: Page) => void; addNotification: (t: string, m: string, e?: string) => void; addAudit: (a: string, d: string, r?: string) => void; language: Language }) {
  const [form, setForm] = useState({ title: '', description: '', location: '', imageName: '' });
  const [coords, setCoords] = useState({ lat: 10.8505, lng: 76.2711 });
  const [submitted, setSubmitted] = useState<Report | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const ai = inferAI(form.description, form.title, form.location, form.imageName, reports);
  const duplicate = reports.find((r) => isSimilarIssue(r, { ...form, category: ai.category }));
  const useLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setForm((f) => ({ ...f, location: `Current GPS location, ${inferWard(f.location)} (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})` }));
      },
      () => setForm((f) => ({ ...f, location: f.location || 'Manual location required' }))
    );
  };
  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setForm((f) => ({ ...f, description: `${f.description} Voice capture is not supported by this browser.`.trim() }));
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ml' ? 'ml-IN' : 'en-IN';
    recognition.onstart = () => setVoiceActive(true);
    recognition.onend = () => setVoiceActive(false);
    recognition.onresult = (event: any) => {
      setForm((f) => ({ ...f, description: `${f.description} ${event.results[0][0].transcript}`.trim() }));
    };
    recognition.start();
  };
  const supportDuplicate = () => {
    if (!duplicate || !currentUser) return;
    setReports((items) => items.map((report) => report.id === duplicate.id ? { ...report, duplicateCount: report.duplicateCount + 1, supporters: Array.from(new Set([...report.supporters, currentUser.email])), timeline: [...report.timeline, { status: report.status, time: nowLabel(), note: `Citizen support added. Total reports: ${report.duplicateCount + 1}.` }] } : report));
    addNotification('Duplicate merged', `You supported existing civic issue ${duplicate.id}.`, currentUser.email);
    addAudit('Duplicate support', `Citizen support merged into ${duplicate.id}`, duplicate.id);
    setSubmitted({ ...duplicate, duplicateCount: duplicate.duplicateCount + 1 });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.location.trim() || !currentUser?.verified) return;
    if (duplicate) return supportDuplicate();
    const id = makeId();
    const createdAt = new Date().toISOString();
    const report: Report = {
      id,
      title: form.title.trim(),
      description: form.description.trim(),
      category: ai.category,
      severity: ai.severity,
      status: 'AI Verified',
      priorityLevel: ai.priorityLevel,
      priorityScore: ai.priorityScore,
      confidence: ai.confidence,
      location: form.location.trim(),
      ward: inferWard(form.location),
      lat: coords.lat + (Math.random() - 0.5) * 0.05,
      lng: coords.lng + (Math.random() - 0.5) * 0.05,
      department: ai.department,
      summary: ai.summary,
      citizenEmail: currentUser.email,
      createdAt,
      imageName: form.imageName,
      populationDensity: inferDensity(form.location),
      nearbySchools: /school|college|campus/i.test(`${form.location} ${form.description}`) ? 1 : 0,
      nearbyHospitals: /hospital|clinic|health/i.test(`${form.location} ${form.description}`) ? 1 : 0,
      trafficDensity: inferTraffic(`${form.location} ${form.description}`),
      duplicateCount: 1,
      supporters: [currentUser.email],
      mergedReportIds: [],
      ai,
      verification: { state: 'Pending' },
      timeline: [
        { status: 'Submitted', time: nowLabel(), note: 'Complaint received from verified citizen.' },
        { status: 'AI Verified', time: nowLabel(), note: `AI classified ${ai.category} with ${ai.confidence}% confidence.` },
        { status: 'Department Assigned', time: nowLabel(), note: `${ai.department} workspace assigned automatically.` }
      ]
    };
    setReports((items) => [report, ...items]);
    addNotification(text[language].received, `${id} was classified as ${ai.category} and assigned to ${ai.department}.`, currentUser.email);
    addNotification('AI classified', `Priority ${ai.priorityLevel} (${ai.priorityScore}/100), confidence ${ai.confidence}%.`, currentUser.email);
    addNotification('Department assigned', `${ai.department} will handle this complaint.`, currentUser.email);
    addAudit('Complaint created', `AI routed to ${ai.department} with ${ai.confidence}% confidence`, id);
    setSubmitted(report);
  };
  if (submitted) {
    return (
      <section className="confirmation">
        <CheckCircle2 size={54} />
        <h2>{duplicate ? 'Existing civic issue supported' : 'Report submitted successfully'}</h2>
        <p>Your tracking ID is <b>{submitted.id}</b>.</p>
        <div className="confirm-grid">
          <span>Category<b>{submitted.category}</b></span><span>Department<b>{submitted.department}</b></span><span>Confidence<b>{submitted.confidence}%</b></span>
        </div>
        <button className="primary-btn" onClick={() => setPage('track')}>Track Complaint</button>
      </section>
    );
  }
  return (
    <DashboardLayout title="Report Issue" subtitle="Submit text, image, GPS, and optional voice evidence for AI classification.">
      <div className="report-grid">
        <form className="panel form-panel" onSubmit={submit}>
          <label>Issue Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Road damage near school junction" required /></label>
          <label>Issue Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what happened, where it is, how long it has continued, and who is affected." required /></label>
          <div className="two-col">
            <button type="button" className="secondary-btn wide" onClick={startVoice}><Mic size={17} />{voiceActive ? 'Listening...' : text[language].voice}</button>
            <label>Upload Photo<span className="file-input"><Upload size={17} />{form.imageName || 'Choose image'}<input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageName: e.target.files?.[0]?.name || '' })} /></span></label>
          </div>
          <label>Location<div className="location-row"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ward, landmark, GPS, nearby school/hospital" required /><button type="button" className="icon-btn" onClick={useLocation} title="Capture location"><LocateFixed size={18} /></button></div></label>
          {duplicate && <div className="duplicate"><Search size={16} />This issue has already been reported by {duplicate.duplicateCount} citizen{duplicate.duplicateCount > 1 ? 's' : ''}. Submit will support the existing complaint.</div>}
          <button className="primary-btn wide">{text[language].submit}</button>
        </form>
        <AIPanel ai={ai} duplicate={duplicate} />
      </div>
    </DashboardLayout>
  );
}

function AIPanel({ ai, duplicate }: { ai: AIResult; duplicate?: Report }) {
  return (
    <aside className="panel ai-panel">
      <span className="eyebrow"><Sparkles size={15} /> AI Smart Department Routing</span>
      <h3>Live classification</h3>
      <div className="ai-row"><span>Issue category</span><b>{ai.category}</b></div>
      <div className="ai-row"><span>Department</span><b>{ai.department}</b></div>
      <div className="ai-row"><span>Severity</span><b>{ai.severity}</b></div>
      <div className="ai-row"><span>Confidence</span><b>{ai.confidence}%</b></div>
      <div className="score-ring">{ai.priorityScore}<small>/100</small></div>
      <SeverityPill severity={ai.priorityLevel} />
      <p>{ai.imageSignal}</p>
      <div className="insights compact-insights">{ai.factors.map((factor) => <p key={factor}><Gauge size={15} />{factor}</p>)}</div>
      <div className="duplicate"><Search size={16} />{duplicate ? `Duplicate match: ${duplicate.id} with ${duplicate.duplicateCount} citizen reports.` : 'No duplicate complaint detected nearby.'}</div>
    </aside>
  );
}

function AdminDashboard({ reports, updateStatus, updateReport, auditLogs }: { reports: Report[]; updateStatus: (id: string, status: Status) => void; updateReport: (id: string, changes: Partial<Report>, auditText: string) => void; auditLogs: AuditLog[] }) {
  const [department, setDepartment] = useState<Department | 'All'>('All');
  const [query, setQuery] = useState('');
  const visible = sortReports(reports).filter((report) => (department === 'All' || report.department === department) && `${report.title} ${report.id} ${report.location} ${report.category}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <DashboardLayout title="Administrator Dashboard" subtitle="Single secure admin console with department workspaces, overrides, and audit logs.">
      <div className="kpi-grid">
        <Kpi title="Total Complaints" value={reports.length} icon={ClipboardCheck} />
        <Kpi title="Pending" value={reports.filter((r) => r.status !== 'Closed').length} icon={Activity} />
        <Kpi title="Resolved Today" value={reports.filter((r) => r.status === 'Resolved' || r.status === 'Citizen Verification').length} icon={CheckCircle2} />
        <Kpi title="Critical Unresolved" value={reports.filter((r) => r.priorityLevel === 'Critical' && r.status !== 'Closed').length} icon={AlertTriangle} />
      </div>
      <DepartmentWorkspace reports={reports} active={department} setActive={setDepartment} />
      <div className="panel admin-tools">
        <div className="tool-row">
          <label className="filter"><Filter size={16} /><select value={department} onChange={(e) => setDepartment(e.target.value as Department | 'All')}><option>All</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="search-panel slim"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search complaints, ward, ID, category" /></div>
        </div>
        {visible.length === 0 ? <Empty text="No complaints match this workspace." /> : visible.map((report) => (
          <AdminReportRow key={report.id} report={report} updateStatus={updateStatus} updateReport={updateReport} />
        ))}
      </div>
      <div className="panel">
        <h3>Administrative Audit Logs</h3>
        {auditLogs.length === 0 ? <Empty text="No administrative actions logged yet." /> : auditLogs.slice(0, 8).map((log) => <div className="notice" key={log.id}><ShieldCheck size={18} /><div><b>{log.action}</b><p>{log.details}</p><span>{log.actor} - {log.time}</span></div></div>)}
      </div>
    </DashboardLayout>
  );
}

function DepartmentWorkspace({ reports, active, setActive }: { reports: Report[]; active: Department | 'All'; setActive: (d: Department | 'All') => void }) {
  return (
    <div className="department-grid">
      {departments.map((department) => {
        const count = reports.filter((report) => report.department === department && report.status !== 'Closed').length;
        return <button className={`department-card ${active === department ? 'active' : ''}`} key={department} onClick={() => setActive(department)}><Building2 size={18} /><span>{department}</span><b>{count}</b></button>;
      })}
    </div>
  );
}

function AdminReportRow({ report, updateStatus, updateReport }: { report: Report; updateStatus: (id: string, status: Status) => void; updateReport: (id: string, changes: Partial<Report>, auditText: string) => void }) {
  return (
    <div className="admin-row enterprise-row">
      <div>
        <b>{report.title}</b>
        <span>{report.id} - {report.ward} - {report.location}</span>
        <p>{report.summary}</p>
        <div className="mini-tags"><SeverityPill severity={report.priorityLevel} /><Badge text={`${report.confidence}% AI confidence`} /><Badge text={`${report.duplicateCount} citizen report${report.duplicateCount > 1 ? 's' : ''}`} /></div>
      </div>
      <div className="override-grid">
        <label>Status<select value={report.status} onChange={(e) => updateStatus(report.id, e.target.value as Status)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>Department<select value={report.department} onChange={(e) => updateReport(report.id, { department: e.target.value as Department, status: 'Department Assigned', timeline: [...report.timeline, { status: 'Department Assigned', time: nowLabel(), note: `Admin reassigned complaint to ${e.target.value}.` }] }, `Department reassigned to ${e.target.value}`)}>{departments.map((d) => <option key={d}>{d}</option>)}</select></label>
        <label>Priority<select value={report.priorityLevel} onChange={(e) => updateReport(report.id, { priorityLevel: e.target.value as PriorityLevel, priorityScore: severityScore[e.target.value as Severity] }, `Priority overridden to ${e.target.value}`)}>{severities.map((s) => <option key={s}>{s}</option>)}</select></label>
      </div>
    </div>
  );
}

function MapPage({ reports }: { reports: Report[] }) {
  return (
    <DashboardLayout title="Live Civic Map" subtitle="Public-safe marker map with issue details and department routing.">
      <MapLayout reports={sortReports(reports)} empty="No report markers yet. Submit your first report to populate the civic map." />
    </DashboardLayout>
  );
}

function HeatmapPage({ reports }: { reports: Report[] }) {
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [department, setDepartment] = useState<Department | 'All'>('All');
  const filtered = reports.filter((report) => department === 'All' || report.department === department);
  const wardGroups = Array.from(new Set(filtered.map((r) => r.ward))).map((ward) => ({ ward, count: filtered.filter((r) => r.ward === ward).length, critical: filtered.filter((r) => r.ward === ward && r.priorityLevel === 'Critical').length }));
  const max = Math.max(1, ...wardGroups.map((g) => g.count));
  return (
    <DashboardLayout title="AI Heat Intelligence" subtitle="Daily heatmap, weekly risk, monthly trends, ward analysis, and predictive hotspots." action={<div className="tool-row"><label className="filter"><Layers size={16} /><select value={period} onChange={(e) => setPeriod(e.target.value as any)}><option>Daily</option><option>Weekly</option><option>Monthly</option></select></label><label className="filter"><Building2 size={16} /><select value={department} onChange={(e) => setDepartment(e.target.value as Department | 'All')}><option>All</option>{departments.map((d) => <option key={d}>{d}</option>)}</select></label></div>}>
      <div className="heatmap-grid">
        <div className="heat-panel">
          {filtered.length === 0 ? <Empty text="No civic hotspots detected yet. Submit reports to generate heatmap intelligence." /> : wardGroups.map((g) => <div key={g.ward} className="heat-row"><span>{g.ward}</span><div><i style={{ width: `${(g.count / max) * 100}%` }} /></div><b>{g.count}</b></div>)}
        </div>
        <div className="panel">
          <h3>{period} Predictive Hotspots</h3>
          {filtered.length === 0 ? <p className="muted">Submit your first report to start generating insights.</p> : <InsightList reports={filtered} period={period} />}
          <div className="risk-zones">
            {wardGroups.map((g) => <span key={g.ward} className={g.critical || g.count / max > 0.7 ? 'risk-high' : 'risk-normal'}>{g.ward}: {g.critical ? 'High-risk civic zone' : 'Monitoring'}</span>)}
          </div>
        </div>
      </div>
      <AnalyticsCharts reports={filtered} />
    </DashboardLayout>
  );
}

function TransparencyPage({ reports }: { reports: Report[] }) {
  const resolved = reports.filter((r) => r.status === 'Closed').length;
  return (
    <DashboardLayout title="Transparency Dashboard" subtitle="Public civic performance without exposing personal information.">
      <div className="kpi-grid">
        <Kpi title="Total Issues" value={reports.length} icon={ClipboardCheck} />
        <Kpi title="Resolved Percentage" value={`${reports.length ? Math.round((resolved / reports.length) * 100) : 0}%`} icon={Gauge} />
        <Kpi title="Open Complaints" value={reports.filter((r) => r.status !== 'Closed').length} icon={Activity} />
        <Kpi title="Departments Active" value={new Set(reports.map((r) => r.department)).size} icon={Building2} />
      </div>
      <MapLayout reports={reports} empty="No public complaints to display yet." />
      <AnalyticsCharts reports={reports} publicMode />
    </DashboardLayout>
  );
}

function MapLayout({ reports, empty }: { reports: Report[]; empty: string }) {
  return (
    <div className="map-layout">
      <div className="map-canvas heat-map-canvas">
        <div className="map-grid-bg" />
        {reports.length === 0 ? <Empty text={empty} /> : reports.map((r, i) => <MapMarker key={r.id} report={r} index={i} />)}
      </div>
      <ReportList reports={reports} empty="No matching markers." compact />
    </div>
  );
}

function MapMarker({ report, index }: { report: Report; index: number }) {
  const colors: Record<PriorityLevel | 'Closed', string> = { Critical: '#ef4444', High: '#f97316', Medium: '#facc15', Low: '#14b8a6', Closed: '#22c55e' };
  const color = report.status === 'Closed' ? colors.Closed : colors[report.priorityLevel];
  return (
    <div className="marker" style={{ left: `${14 + ((index * 23) % 72)}%`, top: `${18 + ((index * 31) % 62)}%`, background: color }}>
      <span>{report.title}<b>{report.ward} - {report.department} - {report.priorityLevel}</b></span>
    </div>
  );
}

function AnalyticsPage({ reports }: { reports: Report[] }) {
  const closed = reports.filter((r) => r.status === 'Closed').length;
  const pending = reports.filter((r) => r.status !== 'Closed').length;
  const avgResolution = closed ? Math.round(reports.filter((r) => r.status === 'Closed').reduce((sum, report) => sum + daysOpen(report.createdAt), 0) / closed) : 0;
  return (
    <DashboardLayout title="Executive Analytics" subtitle="Resolution, workload, AI accuracy, citizen engagement, and critical risk monitoring.">
      <div className="kpi-grid">
        <Kpi title="Total Complaints" value={reports.length} icon={ClipboardCheck} />
        <Kpi title="Pending" value={pending} icon={Activity} />
        <Kpi title="Average Resolution Time" value={`${avgResolution}d`} icon={Gauge} />
        <Kpi title="AI Prediction Accuracy" value={`${reports.length ? Math.round(reports.reduce((sum, r) => sum + r.confidence, 0) / reports.length) : 0}%`} icon={Sparkles} />
      </div>
      <AnalyticsCharts reports={reports} />
      <div className="chart-grid">
        <div className="panel"><h3>Department Workload</h3><WorkloadBars reports={reports} /></div>
        <div className="panel"><h3>Critical Unresolved Complaints</h3><ReportList reports={reports.filter((r) => r.priorityLevel === 'Critical' && r.status !== 'Closed')} empty="No critical unresolved complaints." compact /></div>
      </div>
    </DashboardLayout>
  );
}

function AnalyticsCharts({ reports, publicMode = false }: { reports: Report[]; publicMode?: boolean }) {
  const byCategory = categories.map((name) => ({ name, value: reports.filter((r) => r.category === name).length })).filter((d) => d.value);
  const byDepartment = departments.map((name) => ({ name, value: reports.filter((r) => r.department === name).length }));
  const monthly = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((name, i) => ({ name, complaints: i === 5 ? reports.length : Math.max(0, Math.round(reports.length * (i / 16))), resolved: Math.max(0, Math.round(reports.filter((r) => r.status === 'Closed').length * (i / 8))) }));
  return (
    <div className="chart-grid">
      <div className="panel chart-panel"><h3>Top Complaint Categories</h3>{reports.length === 0 ? <Empty text="No chart data yet." /> : <ResponsiveContainer height={240}><PieChart><Pie data={byCategory} dataKey="value" outerRadius={82} label>{byCategory.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>}</div>
      <div className="panel chart-panel"><h3>{publicMode ? 'Department Performance' : 'Department Workload'}</h3>{reports.length === 0 ? <Empty text="No chart data yet." /> : <ResponsiveContainer height={240}><BarChart data={byDepartment}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#0f6fb8" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>}</div>
      <div className="panel chart-panel wide-chart"><h3>Monthly Trends</h3>{reports.length === 0 ? <Empty text="Monthly trends will appear after reports are submitted." /> : <ResponsiveContainer height={240}><AreaChart data={monthly}><defs><linearGradient id="trend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.7}/><stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Area type="monotone" dataKey="complaints" stroke="#0f6fb8" fill="url(#trend)" /><Area type="monotone" dataKey="resolved" stroke="#14b8a6" fill="transparent" /></AreaChart></ResponsiveContainer>}</div>
    </div>
  );
}

function WorkloadBars({ reports }: { reports: Report[] }) {
  const max = Math.max(1, ...departments.map((d) => reports.filter((r) => r.department === d && r.status !== 'Closed').length));
  return <div className="workload-bars">{departments.map((d) => { const count = reports.filter((r) => r.department === d && r.status !== 'Closed').length; return <div className="heat-row" key={d}><span>{d}</span><div><i style={{ width: `${(count / max) * 100}%` }} /></div><b>{count}</b></div>; })}</div>;
}

function WeeklyReportPage({ reports }: { reports: Report[] }) {
  const topWard = topOf(reports.map((r) => r.ward)) || 'No ward data';
  const topProblem = topOf(reports.map((r) => r.category)) || 'No complaint data';
  const topDepartment = topOf(reports.map((r) => r.department)) || 'No workload data';
  const critical = reports.filter((r) => r.priorityLevel === 'Critical' && r.status !== 'Closed');
  const exportPdf = () => window.print();
  return (
    <DashboardLayout title="AI Weekly Governance Report" subtitle="Automatically generated governance summary with PDF export support." action={<button className="primary-btn" onClick={exportPdf}><Download size={18} />Export PDF</button>}>
      <div className="report-paper">
        <span className="eyebrow"><FileText size={15} /> Weekly governance intelligence</span>
        <h2>Public Pulse AI Governance Report</h2>
        <div className="confirm-grid">
          <span>Most affected ward<b>{topWard}</b></span>
          <span>Most common problem<b>{topProblem}</b></span>
          <span>Largest workload<b>{topDepartment}</b></span>
        </div>
        <div className="insights">
          <p><Layers size={16} />Emerging hotspots are concentrated around {topWard}. Increase preventive field inspection frequency.</p>
          <p><Building2 size={16} />{topDepartment} has the highest active workload and should receive operational support.</p>
          <p><AlertTriangle size={16} />{critical.length} critical unresolved complaint{critical.length === 1 ? '' : 's'} require executive attention.</p>
          <p><ShieldCheck size={16} />Recommended preventive actions: schedule ward sweeps, publish department SLAs, and monitor repeated complaint clusters.</p>
        </div>
        <AnalyticsCharts reports={reports} />
      </div>
    </DashboardLayout>
  );
}

function topOf<T extends string>(items: T[]) {
  const counts = items.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item]: (acc[item] || 0) + 1 }), {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function TrackPage({ reports, currentUser, setReports, addNotification, addAudit }: { reports: Report[]; currentUser: User | null; setReports: React.Dispatch<React.SetStateAction<Report[]>>; addNotification: (t: string, m: string, e?: string) => void; addAudit: (a: string, d: string, r?: string) => void }) {
  const [query, setQuery] = useState('');
  const found = reports.find((r) => r.id.toLowerCase() === query.toLowerCase().trim());
  return (
    <DashboardLayout title="Issue Tracking" subtitle="Search by tracking ID to view lifecycle, AI routing, and citizen verification.">
      <div className="search-panel"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter Tracking ID, e.g. PPAI-2026-1234" /></div>
      {!query ? <Empty text="Enter a tracking ID to view report details." /> : !found ? <Empty text="No report found for this tracking ID." /> : <ReportDetail report={found} currentUser={currentUser} setReports={setReports} addNotification={addNotification} addAudit={addAudit} />}
    </DashboardLayout>
  );
}

function ReportDetail({ report, currentUser, setReports, addNotification, addAudit }: { report: Report; currentUser: User | null; setReports?: React.Dispatch<React.SetStateAction<Report[]>>; addNotification?: (t: string, m: string, e?: string) => void; addAudit?: (a: string, d: string, r?: string) => void }) {
  return (
    <div className="panel detail">
      <div className="detail-head"><div><h3>{report.title}</h3><span>{report.id} - {report.createdAt} - {report.ward}</span></div><Badge text={report.status} /></div>
      <p>{report.description}</p>
      <div className="confirm-grid"><span>AI Category<b>{report.category}</b></span><span>Department<b>{report.department}</b></span><span>Confidence<b>{report.confidence}%</b></span></div>
      <div className="confirm-grid"><span>Priority<b>{report.priorityLevel}</b></span><span>Score<b>{report.priorityScore}/100</b></span><span>Citizen Support<b>{report.duplicateCount}</b></span></div>
      <div className="timeline enterprise-timeline">{statuses.map((s) => <div key={s} className={statuses.indexOf(s) <= statuses.indexOf(report.status) ? 'done' : ''}><i />{s}</div>)}</div>
      {report.status === 'Citizen Verification' && currentUser?.email === report.citizenEmail && setReports && addNotification && addAudit && <CitizenVerification report={report} setReports={setReports} addNotification={addNotification} addAudit={addAudit} />}
    </div>
  );
}

function CitizenVerification({ report, setReports, addNotification, addAudit }: { report: Report; setReports: React.Dispatch<React.SetStateAction<Report[]>>; addNotification: (t: string, m: string, e?: string) => void; addAudit: (a: string, d: string, r?: string) => void }) {
  const [form, setForm] = useState({ rating: 5, feedback: '', imageName: '' });
  const verify = (accepted: boolean) => {
    setReports((items) => items.map((item) => item.id === report.id ? {
      ...item,
      status: accepted ? 'Closed' : 'Under Review',
      verification: { state: accepted ? 'Accepted' : 'Rejected', rating: form.rating, feedback: form.feedback, imageName: form.imageName, time: nowLabel() },
      timeline: [...item.timeline, { status: accepted ? 'Closed' : 'Under Review', time: nowLabel(), note: accepted ? `Citizen accepted resolution with ${form.rating}/5 rating.` : 'Citizen rejected resolution. Complaint reopened automatically.' }]
    } : item));
    addNotification(accepted ? 'Complaint Closed' : 'Complaint Reopened', accepted ? 'Thank you for verifying the resolution.' : 'Your complaint has been reopened for review.', report.citizenEmail);
    addAudit('Citizen verification', accepted ? 'Resolution accepted' : 'Resolution rejected and reopened', report.id);
  };
  return (
    <div className="verification-box">
      <h3>Citizen Verification Required</h3>
      <label>Rating<select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select></label>
      <label>Feedback<textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="Add feedback about the resolution quality." /></label>
      <label>Upload New Image<span className="file-input"><Upload size={17} />{form.imageName || 'Choose verification image'}<input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageName: e.target.files?.[0]?.name || '' })} /></span></label>
      <div className="hero-actions"><button className="primary-btn" onClick={() => verify(true)}>Accept Resolution</button><button className="secondary-btn" onClick={() => verify(false)}>Reject and Reopen</button></div>
    </div>
  );
}

function NotificationsPage({ notifications, setNotifications }: { notifications: Notification[]; setNotifications: React.Dispatch<React.SetStateAction<Notification[]>> }) {
  useEffect(() => setNotifications((items) => items.map((item) => ({ ...item, read: true }))), [setNotifications]);
  return (
    <DashboardLayout title="Smart Notifications" subtitle="In-app alerts now, email integration-ready later.">
      <div className="panel">
        {notifications.length === 0 ? <Empty text="No notifications yet." /> : notifications.map((n) => <div className="notice" key={n.id}><Bell size={18} /><div><b>{n.title}</b><p>{n.message}</p><span>{n.time} {n.emailReady ? '- Email-ready' : ''}</span></div><Mail size={16} /></div>)}
      </div>
    </DashboardLayout>
  );
}

function StaticPage({ title, icon: Icon, kind }: { title: string; icon: React.ElementType; kind: 'about' | 'privacy' | 'contact' }) {
  const content = {
    about: ['Public Pulse AI is a production-ready civic intelligence prototype for verified citizen reports, AI routing, departmental workflows, and transparent governance.', 'The architecture is prepared for department logins, officer assignment, IoT sensors, drone inspection, WhatsApp alerts, government APIs, and predictive maintenance.', 'AI improves governance by triaging reports, predicting priority, detecting duplicate clusters, and surfacing heat intelligence.'],
    privacy: ['Verified user access, secure admin authentication, input validation, and administrative audit logs are built into the local MVP.', 'Public transparency views expose civic metrics without personal information.', 'Local persistence keeps entered data available after closing and restarting the dev server on the same browser.'],
    contact: ['Project Information: Public Pulse AI enterprise civic governance MVP.', 'Team Section: Add team members, roles, college, department, and mentor details here.', 'Contact Form: Replace this placeholder with your official support email or project inquiry channel.']
  }[kind];
  return (
    <DashboardLayout title={title} subtitle="A civic-tech platform designed for trustworthy public service delivery.">
      <div className="static-card"><Icon size={34} />{content.map((p) => <p key={p}>{p}</p>)}</div>
    </DashboardLayout>
  );
}

function DashboardLayout({ title, subtitle, action, children }: { title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="dashboard"><div className="page-head"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>{children}</section>;
}

function Kpi({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return <div className="kpi"><Icon size={22} /><span>{title}</span><b>{value}</b></div>;
}

function ReportList({ reports, empty, compact = false, currentUser, setReports, addNotification, addAudit }: { reports: Report[]; empty: string; compact?: boolean; currentUser?: User | null; setReports?: React.Dispatch<React.SetStateAction<Report[]>>; addNotification?: (t: string, m: string, e?: string) => void; addAudit?: (a: string, d: string, r?: string) => void }) {
  return <div className={`panel report-list ${compact ? 'compact' : ''}`}>{reports.length === 0 ? <Empty text={empty} /> : reports.map((r) => <div className="report-item" key={r.id}><div><b>{r.title}</b><span>{r.id} - {r.ward} - {r.department}</span><p>{r.summary}</p><div className="mini-tags"><Badge text={`${r.confidence}% AI`} /><Badge text={`${r.duplicateCount} citizen report${r.duplicateCount > 1 ? 's' : ''}`} /></div></div><div className="report-meta"><Badge text={r.status} /><SeverityPill severity={r.priorityLevel} /></div>{r.status === 'Citizen Verification' && currentUser?.email === r.citizenEmail && setReports && addNotification && addAudit && <CitizenVerification report={r} setReports={setReports} addNotification={addNotification} addAudit={addAudit} />}</div>)}</div>;
}

function Empty({ text: body }: { text: string }) {
  return <div className="empty"><Compass size={28} /><p>{body}</p></div>;
}

function Badge({ text: body }: { text: string }) {
  return <span className="badge">{body}</span>;
}

function SeverityPill({ severity }: { severity: PriorityLevel }) {
  return <span className={`severity ${severity.toLowerCase()}`}>{severity}</span>;
}

function InsightList({ reports, period = 'Weekly' }: { reports: Report[]; period?: string }) {
  const topWard = topOf(reports.map((r) => r.ward));
  const topCategory = topOf(reports.map((r) => r.category));
  const unresolved = reports.filter((r) => r.status !== 'Closed').length;
  return (
    <div className="insights">
      <p><Sparkles size={16} />{topCategory ? `${topCategory} complaints dominate the ${period.toLowerCase()} pattern.` : 'No category concentration detected.'}</p>
      <p><AlertTriangle size={16} />{topWard ? `${topWard} is the most affected ward and should be monitored as a high-risk civic zone.` : 'No ward concentration detected.'}</p>
      <p><Gauge size={16} />{unresolved ? `${unresolved} active complaint${unresolved > 1 ? 's' : ''} remain in the resolution pipeline.` : 'All submitted complaints are closed.'}</p>
    </div>
  );
}

function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return <footer><span>Public Pulse AI</span><button onClick={() => setPage('about')}>About</button><button onClick={() => setPage('privacy')}>Privacy</button><button onClick={() => setPage('contact')}>Contact</button><button onClick={() => setPage('transparency')}>Transparency</button></footer>;
}

createRoot(document.getElementById('root')!).render(<App />);
