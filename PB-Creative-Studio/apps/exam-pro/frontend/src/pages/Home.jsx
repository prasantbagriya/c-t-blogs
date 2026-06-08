import { useState } from 'react';
import GlobalNavbar from '../components/GlobalNavbar';
import GlobalFooter from '../components/GlobalFooter';
import {
  GraduationCap, BookOpen, Users, ClipboardCheck,
  Shield, Zap, BarChart3, ArrowRight, Trophy, Clock, Star,
  CheckCircle, ChevronDown, ChevronUp, Lock, Smartphone, 
  FileText, Download, Globe, Settings
} from 'lucide-react';

// ─── SEO Head (injected via Helmet-like inline approach) ───────────────────
// Title: Online Exam System & CBT Software for Schools – EduExam Pro | ChatWizs
// Meta Desc: EduExam Pro is a powerful online exam system and CBT software for schools,
//            colleges & institutes. Secure testing, auto-grading, real-time analytics. Try free today!

const features = [
  {
    icon: Lock, title: 'Computer-Based Testing (CBT)',
    desc: 'Browser lockdown, question randomization, option shuffling, countdown timer, IP-based access control, and one-time login tokens for maximum exam integrity.',
    color: 'indigo'
  },
  {
    icon: BookOpen, title: 'Comprehensive Question Bank',
    desc: 'MCQ, True/False, Fill in the Blank, Short Answer & Descriptive. Rich text editor with LaTeX, images, tables. Bulk import from Word/Excel.',
    color: 'violet'
  },
  {
    icon: Zap, title: 'Instant Auto-Grading',
    desc: 'Objective questions graded the moment students submit. Calculates score, percentage, generates detailed result reports with answer explanations.',
    color: 'amber'
  },
  {
    icon: BarChart3, title: 'Real-Time Analytics Dashboard',
    desc: 'Class-level overview, question-level analysis, student performance tracking, subject-wise breakdown. Export PDF & Excel reports.',
    color: 'emerald'
  },
  {
    icon: Users, title: 'Complete Student & Teacher Management',
    desc: 'Bulk student import from Excel. Role-based access: Admin, Teacher, Invigilator, Student. Parent portal & automatic email/SMS notifications.',
    color: 'rose'
  },
  {
    icon: Clock, title: 'Exam Scheduling & Management',
    desc: 'Set start/end times, multiple attempts, grace periods, pause & resume. Manage separate exam windows for different classes simultaneously.',
    color: 'cyan'
  },
];

const stats = [
  { value: '100+', label: 'Institutions' },
  { value: '4K+', label: 'Students/Month' },
  { value: '100%', label: 'Free to Start' },
  { value: '24/7', label: 'Available' },
];

const comparisonData = [
  { feature: '100% Free Plan', eduexam: true, examsoft: false, proprofs: 'Limited', google: true },
  { feature: 'CBT Support', eduexam: true, examsoft: true, proprofs: true, google: false },
  { feature: 'Auto-Grading', eduexam: true, examsoft: true, proprofs: true, google: 'Basic' },
  { feature: 'Analytics Dashboard', eduexam: true, examsoft: 'Advanced', proprofs: true, google: 'Basic' },
  { feature: 'Mobile Friendly', eduexam: true, examsoft: true, proprofs: true, google: true },
  { feature: 'No Software Install', eduexam: true, examsoft: false, proprofs: true, google: true },
  { feature: 'Question Import (Excel)', eduexam: true, examsoft: true, proprofs: true, google: false },
  { feature: 'Institute Management', eduexam: true, examsoft: 'Limited', proprofs: false, google: false },
  { feature: 'Setup Time', eduexam: '< 5 min', examsoft: 'Days', proprofs: 'Hours', google: 'Minutes' },
];

const userTypes = [
  { icon: GraduationCap, type: 'Schools (Classes 1–12)', usage: 'Class tests, unit tests, mid-term & final exams, entrance tests for new admissions', color: '#818cf8' },
  { icon: BookOpen, type: 'Colleges & Universities', usage: 'Semester exams, internal assessments, scholarship tests, placement tests', color: '#10b981' },
  { icon: Trophy, type: 'Coaching Institutes', usage: 'JEE, NEET, UPSC, competitive exam practice tests, weekly mock tests', color: '#f59e0b' },
  { icon: Shield, type: 'Government Institutes', usage: 'Recruitment exams, departmental tests, promotion assessments', color: '#f43f5e' },
  { icon: Settings, type: 'Corporate Training', usage: 'Employee skill assessments, compliance tests, certification exams', color: '#06b6d4' },
  { icon: FileText, type: 'Teachers & Tutors', usage: 'Individual class quizzes, homework assignments, formative assessments', color: '#a855f7' },
];

const steps = [
  { num: '01', title: 'Create Your Free Account', desc: 'Visit chatwizs.com/portal and sign up with your email. No credit card required. Your institute dashboard is ready in 60 seconds.' },
  { num: '02', title: 'Set Up Your Institute', desc: 'Add your institute name, logo, classes, and subjects. Import your student list from an Excel file or add students manually.' },
  { num: '03', title: 'Create Your First Exam', desc: 'Use the intuitive question builder to create your exam. Add questions, set the time limit, configure security settings, and schedule.' },
  { num: '04', title: 'Invite Students & Monitor Results', desc: 'Share the exam link with students. Monitor live exam progress from your dashboard and review auto-generated results the moment exam ends.' },
];

const faqs = [
  {
    q: 'Is EduExam Pro completely free?',
    a: 'EduExam Pro offers a generous free plan that includes unlimited exam creation, up to 100 students, auto-grading, and basic analytics. Premium plans with advanced features (unlimited students, AI proctoring, custom branding, priority support) are available for larger institutions.'
  },
  {
    q: 'Does EduExam Pro support CBT (Computer-Based Testing)?',
    a: 'Yes. CBT is EduExam Pro\'s primary strength. The platform is built from the ground up for computer-based testing, with features like browser lockdown, question randomization, countdown timer, live invigilation, and instant results.'
  },
  {
    q: 'Can students take exams on smartphones?',
    a: 'Yes. EduExam Pro is fully mobile-responsive. Students can log in and take exams on any Android or iOS smartphone, tablet, or computer using any modern browser. No app download is required.'
  },
  {
    q: 'How secure are exams on EduExam Pro?',
    a: 'EduExam Pro implements multiple layers: HTTPS encryption, question randomization, answer option shuffling, browser tab-switching detection, IP-based access control, time-limited access, and unique login tokens.'
  },
  {
    q: 'Can I import questions from Word or Excel?',
    a: 'Yes. EduExam Pro supports bulk question import from Microsoft Word and Excel files using a simple template. You can import hundreds of questions in minutes, saving enormous amounts of time when setting up large question banks.'
  },
  {
    q: 'How many students can take an exam simultaneously?',
    a: 'EduExam Pro\'s infrastructure is built to handle thousands of concurrent users. The platform is hosted on scalable cloud servers that automatically adjust capacity during peak exam periods.'
  },
  {
    q: 'Does EduExam Pro work without internet?',
    a: 'EduExam Pro is a web-based platform and requires an internet connection. However, it is optimized for low-bandwidth environments, making it suitable for schools and institutes in areas with limited connectivity.'
  },
  {
    q: 'Can I customize the exam portal with my institute\'s branding?',
    a: 'Yes. Premium plan subscribers can customize EduExam Pro with their institute\'s name, logo, colors, and domain — creating a fully branded examination experience for your students.'
  },
];

const testimonials = [
  { name: 'Dr. Rajesh Kumar', role: 'School Principal', text: 'EduExam Pro has completely transformed our semester planning. Highly secure and intuitive.' },
  { name: 'Sarah Jenkins', role: 'Academy Director', text: 'The real-time analytics are a game-changer for student performance tracking.' },
  { name: 'Amit Sharma', role: 'Govt. Exam Coordinator', text: 'Safest platform we have used. The anti-tab switch feature is foolproof.' },
  { name: 'Dr. Elena Vance', role: 'University Dean', text: 'Scaling to thousands of students was effortless. Exceptional engineering.' },
  { name: 'Preeti Singh', role: 'Coaching Head', text: 'The question bank management is surgically precise. Saved us hundreds of hours.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '20px 0'
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', background: 'none', border: 'none',
          color: '#f1f5f9', cursor: 'pointer', textAlign: 'left', gap: 16
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700 }}>{q}</span>
        {open ? <ChevronUp size={18} style={{ color: '#818cf8', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: '#64748b', flexShrink: 0 }} />}
      </button>
      {open && (
        <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.8, marginTop: 14, paddingRight: 32 }}>
          {a}
        </p>
      )}
    </div>
  );
}

function CheckCell({ val }) {
  if (val === true) return <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Yes</span>;
  if (val === false) return <span style={{ color: '#f43f5e', fontWeight: 700 }}>✗ No</span>;
  return <span style={{ color: '#f59e0b', fontWeight: 600 }}>{val}</span>;
}

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0b1a',
      color: '#f1f5f9',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* Schema Markup — SoftwareApplication */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "EduExam Pro",
        "url": "https://chatwizs.com/portal/",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser (Any OS)",
        "description": "EduExam Pro is a comprehensive online examination management system and CBT software for schools, colleges, and institutes. Features include secure testing, auto-grading, real-time analytics, and student management.",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free to start" },
        "featureList": ["Computer-Based Testing (CBT)", "Auto-Grading & Instant Results", "Real-Time Analytics Dashboard", "Student & Teacher Management", "Question Bank Builder", "Secure Exam Environment", "MCQ, True/False, Descriptive Questions", "Mobile-Friendly Interface"],
        "provider": { "@type": "Organization", "name": "ChatWizs Studio", "url": "https://chatwizs.com" }
      })}} />

      {/* Schema Markup — FAQPage */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      })}} />

      {/* Mesh Background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(at 0% 0%, rgba(99,102,241,0.15) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(139,92,246,0.15) 0px, transparent 50%),
          radial-gradient(at 50% 100%, rgba(99,102,241,0.08) 0px, transparent 50%)
        `
      }} />

      <GlobalNavbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(100px, 14vh, 140px) clamp(16px, 5vw, 40px) 80px',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 20, padding: '8px 18px', marginBottom: 28,
            fontSize: 13, fontWeight: 700, color: '#818cf8'
          }}>
            <Star size={14} fill="currentColor" /> Free Online Exam System — CBT Software for Schools
          </div>

          {/* H1 — Primary keyword "Online Exam System for Schools & Institutes" */}
          <h1 style={{
            fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: 24,
            background: 'linear-gradient(135deg, #f1f5f9 0%, #818cf8 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Online Exam System for<br />Schools &amp; Institutes
          </h1>

          <p style={{ fontSize: 'clamp(16px, 3vw, 19px)', color: '#94a3b8', lineHeight: 1.8, marginBottom: 16, maxWidth: 660, margin: '0 auto 16px' }}>
            <strong style={{ color: '#c7d2fe' }}>EduExam Pro by ChatWizs</strong> — a powerful, cloud-based online exam system and CBT software designed for schools, colleges, coaching institutes, and universities. Conduct secure online exams, auto-grade results, and track student performance — all for free.
          </p>

          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 44 }}>
            No software installation · No credit card · 100% browser-based · Works on mobile
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/portal/student/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 700, fontSize: 16,
              padding: '16px 32px', borderRadius: 12, textDecoration: 'none',
              boxShadow: '0 0 30px rgba(99,102,241,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <GraduationCap size={20} /> Student Login <ArrowRight size={18} />
            </a>
            <a href="/portal/admin/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9', fontWeight: 700, fontSize: 16,
              padding: '16px 32px', borderRadius: 12, textDecoration: 'none',
              transition: 'background 0.2s'
            }}>
              <Shield size={20} /> Admin Panel
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section style={{ padding: '0 clamp(16px, 5vw, 40px) 80px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 1, background: 'rgba(99,102,241,0.15)',
          borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.15)'
        }}>
          {stats.map(s => (
            <div key={s.label} style={{ padding: 'clamp(20px,4vw,32px) 24px', textAlign: 'center', background: '#0f1129' }}>
              <div style={{ fontSize: 'clamp(24px,6vw,36px)', fontWeight: 900, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTRODUCTION CONTENT (SEO Body) ──────────────── */}
      <section style={{ padding: '20px clamp(16px, 5vw, 40px) 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 'clamp(28px,4vw,48px)' }}>
          <h2 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, marginBottom: 20, color: '#c7d2fe' }}>
            What is EduExam Pro?
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.9, marginBottom: 20 }}>
            EduExam Pro is an enterprise-grade <strong style={{ color: '#f1f5f9' }}>online examination management system</strong> built by ChatWizs Studio. It provides educational institutions with a complete digital ecosystem for managing the entire exam lifecycle — from question creation and student enrollment to secure exam delivery, automatic grading, result publishing, and performance analytics.
          </p>
          <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.9, marginBottom: 20 }}>
            Unlike basic quiz tools, EduExam Pro is built for the real-world demands of schools and institutes: handling large numbers of simultaneous test-takers, maintaining exam integrity, generating detailed performance reports, and providing a smooth, professional exam experience for students on any device.
          </p>
          <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.9 }}>
            Our <strong style={{ color: '#f1f5f9' }}>computer-based testing (CBT) software</strong> empowers teachers and administrators to create exams in minutes, manage hundreds of students effortlessly, deliver secure assessments, and receive instant auto-graded results with detailed analytics. Say goodbye to paper-based exams forever.
          </p>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section style={{ padding: '40px clamp(16px, 5vw, 40px) 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,8vw,60px)' }}>
            <h2 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 800, marginBottom: 16 }}>
              Key Features of EduExam Pro Online Exam System
            </h2>
            <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 540, margin: '0 auto' }}>
              A fully-featured <strong style={{ color: '#f1f5f9' }}>CBT software for schools</strong> covering the entire exam lifecycle.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px,30vw,360px),1fr))', gap: 24 }}>
            {features.map((f, i) => {
              const colorMap = { indigo: '#6366f1', violet: '#8b5cf6', amber: '#f59e0b', emerald: '#10b981', rose: '#f43f5e', cyan: '#06b6d4' };
              const c = colorMap[f.color];
              return (
                <div key={i} style={{
                  padding: 32, borderRadius: 20,
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${c}22`,
                  transition: 'transform 0.2s, border-color 0.2s'
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${c}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20, color: c
                  }}>
                    <f.icon size={24} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.75 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHO USES ────────────────────────────────────────── */}
      <section style={{ padding: '80px clamp(16px, 5vw, 40px)', background: 'rgba(99,102,241,0.02)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 800, marginBottom: 16 }}>
              Who Uses EduExam Pro?
            </h2>
            <p style={{ fontSize: 16, color: '#94a3b8' }}>
              Designed for every type of educational institution and professional
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>
            {userTypes.map((u, i) => (
              <div key={i} style={{
                padding: '24px 28px', borderRadius: 16,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: 16, alignItems: 'flex-start'
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${u.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: u.color }}>
                  <u.icon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{u.type}</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{u.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO GET STARTED ───────────────────────────────── */}
      <section style={{ padding: '80px clamp(16px, 5vw, 40px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 800, marginBottom: 16 }}>
              How to Get Started with EduExam Pro — 4 Simple Steps
            </h2>
            <p style={{ fontSize: 16, color: '#94a3b8' }}>
              Set up your first <strong style={{ color: '#f1f5f9' }}>online exam system</strong> in under 5 minutes — no credit card required
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                padding: 28, borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
                border: '1px solid rgba(99,102,241,0.15)'
              }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'rgba(99,102,241,0.3)', marginBottom: 12 }}>{s.num}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40, padding: 24, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16 }}>
            <p style={{ color: '#818cf8', fontSize: 15, fontWeight: 600 }}>
              💡 Pro Tip: EduExam Pro offers a free demo mode where you can explore all features before setting up your institute.
            </p>
          </div>
        </div>
      </section>

      {/* ── TWO PORTALS CTA ─────────────────────────────────── */}
      <section style={{ padding: '80px clamp(16px,5vw,40px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 800, marginBottom: 16 }}>Choose Your Portal</h2>
            <p style={{ color: '#94a3b8' }}>Select the interface that matches your role in the ecosystem.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(300px,45%,500px),1fr))', gap: 40 }}>
            <div style={{ padding: 'clamp(32px,5vw,48px)', borderRadius: 28, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.3)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(99,102,241,0.1)' }} />
              <Shield size={42} style={{ color: '#818cf8', marginBottom: 24 }} />
              <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 14 }}>Admin Portal</h3>
              <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                Manage the entire exam ecosystem. Add classes, upload students, build question banks, create exams and view analytics.
              </p>
              <a href="/portal/admin/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: 10, textDecoration: 'none' }}>
                Go to Admin Panel <ArrowRight size={18} />
              </a>
            </div>
            <div style={{ padding: 'clamp(32px,5vw,48px)', borderRadius: 28, background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))', border: '1px solid rgba(16,185,129,0.25)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(16,185,129,0.08)' }} />
              <GraduationCap size={42} style={{ color: '#10b981', marginBottom: 24 }} />
              <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 14 }}>Student Portal</h3>
              <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                Login with your mobile number, view assigned exams, attempt them with a live timer, and see your results instantly.
              </p>
              <a href="/portal/student/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: 10, textDecoration: 'none' }}>
                Student Login <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ─────────────────────────────────── */}
      <section style={{ padding: '80px clamp(16px,5vw,40px)', background: 'rgba(10,11,26,0.5)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px,5vw,36px)', fontWeight: 800, marginBottom: 16 }}>
              EduExam Pro vs Other Online Exam Software
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16 }}>How does EduExam Pro compare to the most popular exam platforms?</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.3)' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>Feature</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', color: '#818cf8', fontWeight: 800, background: 'rgba(99,102,241,0.08)', borderRadius: '8px 8px 0 0' }}>EduExam Pro</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>ExamSoft</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>ProProfs</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>Google Forms</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '14px 16px', color: '#cbd5e1', fontWeight: 600 }}>{row.feature}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', background: 'rgba(99,102,241,0.04)' }}>
                      <CheckCell val={row.eduexam} />
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}><CheckCell val={row.examsoft} /></td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}><CheckCell val={row.proprofs} /></td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}><CheckCell val={row.google} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SEO CONTENT — Why EduExam ────────────────────────── */}
      <section style={{ padding: '80px clamp(16px,5vw,40px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,34px)', fontWeight: 800, marginBottom: 40, color: '#e2e8f0' }}>
            Why Schools Choose EduExam Pro as Their Online Exam Platform
          </h2>
          <div style={{ display: 'grid', gap: 32 }}>
            {[
              { title: 'Free Online Exam Software — No Hidden Costs', body: 'EduExam Pro offers a generous free plan with unlimited exam creation, up to 100 students, auto-grading, and basic analytics. No credit card, no trial period, no hidden fees — the core platform is genuinely free for schools and institutes.' },
              { title: 'Secure Online Exam Platform with Anti-Cheating', body: 'Our proctored online exam software includes browser lockdown, question randomization, answer shuffling, tab-switch detection, and unique login tokens. These enterprise-grade security features are available even on the free plan — not locked behind a premium paywall.' },
              { title: 'MCQ Exam Software Supporting All Question Types', body: 'Beyond MCQ, EduExam Pro supports True/False, Fill in the Blank, Short Answer, and Descriptive questions — with a rich text editor that accepts images, LaTeX equations, and formatted tables. Build the perfect question for any subject.' },
              { title: 'Real-Time Exam Analytics for Better Outcomes', body: 'Our real-time exam analytics dashboard gives teachers, administrators, and institute management a complete view of student performance. Identify learning gaps, compare class performance across attempts, and generate exportable PDF & Excel reports for parent-teacher meetings.' },
              { title: 'School Exam Management System — All-In-One', body: 'Beyond just exams, EduExam Pro is a complete school exam management system and institute management software. Manage students, teachers, classes, subjects, exam schedules, and results from one centralized dashboard — replacing expensive enterprise software with a free, powerful alternative.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '28px 32px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, color: '#c7d2fe' }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.8 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section style={{ padding: '80px 0', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>Trusted by Educators Worldwide</h2>
          <p style={{ color: '#64748b', marginTop: 8 }}>Join hundreds of educational institutions that trust EduExam Pro</p>
        </div>
        <div style={{ display: 'flex', gap: 24, padding: '0 clamp(16px,5vw,40px)', overflow: 'auto', paddingBottom: 12 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ minWidth: 340, padding: 28, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />)}
              </div>
              <p style={{ fontStyle: 'italic', color: '#f1f5f9', marginBottom: 20, lineHeight: 1.7 }}>"{t.text}"</p>
              <div style={{ fontWeight: 800, color: '#818cf8' }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section style={{ padding: '80px clamp(16px,5vw,40px)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(26px,4vw,36px)', fontWeight: 800, marginBottom: 16 }}>
              Frequently Asked Questions — EduExam Pro
            </h2>
            <p style={{ color: '#94a3b8' }}>Everything you need to know about our free online exam system</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 'clamp(24px,4vw,40px)' }}>
            {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── INTERNAL LINK — YouTube Downloader ───────────────── */}
      <section style={{ padding: '0 clamp(16px,5vw,40px) 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 40px', borderRadius: 20, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: '#818cf8', fontWeight: 700, marginBottom: 6 }}>Explore More ChatWizs Tools</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Free YouTube Video Downloader</h3>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>Download YouTube videos in MP4 (4K, 1080p) and MP3 format — 100% free, no software needed.</p>
          </div>
          <a href="/youtubevideodownload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 700, padding: '14px 24px', borderRadius: 10, textDecoration: 'none', flexShrink: 0 }}>
            <Download size={18} /> YouTube Downloader →
          </a>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '80px clamp(16px,5vw,40px) 100px' }}>
        <div style={{
          maxWidth: 860, margin: '0 auto', textAlign: 'center',
          padding: 'clamp(48px,6vw,72px)', borderRadius: 32,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 0 80px rgba(99,102,241,0.15)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <Trophy size={48} style={{ color: '#818cf8', marginBottom: 20 }} />
            <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 900, marginBottom: 16 }}>
              Start Your Free Online Exam System Today
            </h2>
            <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.8, marginBottom: 12, maxWidth: 560, margin: '0 auto 12px' }}>
              Join hundreds of schools, colleges, and coaching institutes that have already transformed their examination process with EduExam Pro.
            </p>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 36 }}>
              Sign up in 60 seconds — no credit card required, no software to install, no complicated setup.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/portal/admin/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 16, padding: '16px 36px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
                Get Started Free → <ArrowRight size={18} />
              </a>
              <a href="/portal/student/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', fontWeight: 700, fontSize: 16, padding: '16px 36px', borderRadius: 12, textDecoration: 'none' }}>
                <GraduationCap size={18} /> Student Login
              </a>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
