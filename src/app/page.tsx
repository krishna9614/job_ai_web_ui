/* eslint-disable @next/next/no-img-element */
import { ArrowRight, Bot, Briefcase, Calendar, CircleCheck, FileText, Globe, LayoutDashboard, Mail, Minus, Quote, Search, ShieldCheck, Sparkles, Star, Target, TrendingUp, Upload, UserCheck, UserPlus, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_HREF } from "@/lib/config";
import { LeafShape, LinkedinBrandIcon, LinkedinIcon, SprigShape } from "@/components/icons/brand";

export const metadata: Metadata = { title: { absolute: "JobAI — Your Personal AI Job Application Assistant" } };

/** Frame 01 — landing page, ported from the design showcase. */
export default function LandingPage() {
  return (
  <main className="landing" style={{ position: "relative", overflow: "hidden" }}>

      {/* Hero organic shapes */}
      <LeafShape className="leaf" style={{ top: "-40px", right: "-60px", width: "360px", height: "360px", color: "#E7F1E9", transform: "rotate(35deg)" }} />
      <SprigShape className="leaf" style={{ top: "400px", left: "-62px", width: "120px", height: "200px", color: "#CFE3D5", transform: "rotate(18deg)" }} />

      <nav className="nav">
        <Link className="logo" href="/"><span className="logo-mark"><Sparkles className="ic" /></span><span>Job<b>AI</b></span></Link>
        <div className="nav-links">
          <a className="active" href="#top">Home</a><a href="#features">Features</a><a href="#how-it-works">How It Works</a><a href="#faq">About</a>
        </div>
        <div className="nav-cta">
          <Link className="login" href="/login">Login</Link>
          <Link className="btn btn-primary btn-sm" href="/signup">Get Started <span className="arrow"><ArrowRight className="ic ic-sm" /></span></Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero" id="top">
        <div className="container hero-grid">
          <div>
            <span className="badge"><span className="dot"><Sparkles className="ic ic-xs" /></span>AI-Powered Career Platform</span>
            <h1>Your Personal <span className="hl">AI Job Application</span> Assistant</h1>
            <p className="lead">JobAI finds the right roles, tailors your resume for each one, and keeps every application, email and interview organised — so you can focus on landing the offer.</p>
            <ul className="checklist">
              <li><span className="tick"><Search className="ic ic-sm" /></span>AI finds jobs that match your skills &amp; goals</li>
              <li><span className="tick"><FileText className="ic ic-sm" /></span>Tailored resumes for every application</li>
              <li><span className="tick"><LayoutDashboard className="ic ic-sm" /></span>Track applications &amp; interviews in one place</li>
              <li><span className="tick"><Mail className="ic ic-sm" /></span>Gmail &amp; Google Calendar sync</li>
              <li><span className="tick"><TrendingUp className="ic ic-sm" /></span>Personalised career insights</li>
            </ul>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href="/signup">Get Started Free <span className="arrow"><ArrowRight className="ic ic-sm" /></span></Link>
              <a className="btn btn-outline" href="#features">Explore Features</a>
            </div>
            <div className="hero-proof">
              <div className="avatars">
                <span style={{ background: "#086B50" }}>JM</span><span style={{ background: "#B7793A" }}>AR</span><span style={{ background: "#15966D" }}>SK</span><span style={{ background: "#4E5D57" }}>DL</span>
              </div>
              <div><span className="stars"><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /></span><br /><b style={{ color: "var(--text)" }}>4.9/5</b> from 12,000+ job seekers</div>
            </div>
          </div>

          {/* Hero avatar (from reference design) with floating cards */}
          <div className="avatar-stage">
            <img className="hero-avatar" src="/images/hero-avatar.jpg" width={1200} height={1148} alt="Smiling job seeker with laptop" />
            <div className="float f-profile">
              <div className="ring"><span>95%</span></div>
              <div><b>95% Profile Complete</b><small>Add 1 portfolio link</small></div>
            </div>
            <div className="float f-matches">
              <span className="icon-tile"><Briefcase className="ic" /></span>
              <div><b>120k+</b><small>Jobs Matching</small></div>
            </div>
            <div className="float f-jobs">
              <h5>Top matches <span>View all</span></h5>
              <div className="job"><span className="co co-sm co-g">G</span><div><b>Senior UX Designer</b><small>Google · Remote</small></div><span className="pill">98%</span></div>
              <div className="job"><span className="co co-sm co-m">M</span><div><b>Product Manager</b><small>Microsoft · Seattle</small></div><span className="pill">94%</span></div>
              <div className="job"><span className="co co-sm co-a">a</span><div><b>Data Analyst II</b><small>Amazon · Austin</small></div><span className="pill pill-amber">89%</span></div>
            </div>
          </div>
        </div>
      </header>

      {/* Trusted by */}
      <div className="trusted">
        <div className="container">
          <p>Trusted by job seekers who landed roles at</p>
          <div className="logos"><span>Google</span><span>Microsoft</span><span>amazon</span><span>Spotify</span><span>airbnb</span><span>STRIPE</span><span>Netflix</span><span>Deloitte.</span></div>
        </div>
      </div>

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h2>Everything you need to <span className="hl">land your next role</span></h2>
            <p>One intelligent workspace that handles the busywork of job hunting — from discovery to signed offer.</p>
          </div>
          <div className="features-grid">
            <div className="card feature"><span className="icon-tile"><FileText className="ic ic-lg" /></span><h3>AI Resume Analysis</h3><p>Instant ATS score, keyword gaps and rewrite suggestions tuned to each job description.</p><a className="more" href="#how-it-works">Learn more <ArrowRight className="ic ic-sm" /></a></div>
            <div className="card feature"><span className="icon-tile"><Target className="ic ic-lg" /></span><h3>Personalized Job Recommendations</h3><p>Daily matches ranked by skills, salary, location and culture fit — not just keywords.</p><a className="more" href="#how-it-works">Learn more <ArrowRight className="ic ic-sm" /></a></div>
            <div className="card feature"><span className="icon-tile"><LayoutDashboard className="ic ic-lg" /></span><h3>Application Tracking</h3><p>A visual pipeline from Saved to Offer, with reminders so nothing slips through.</p><a className="more" href="#how-it-works">Learn more <ArrowRight className="ic ic-sm" /></a></div>
            <div className="card feature"><span className="icon-tile"><Mail className="ic ic-lg" /></span><h3>Gmail Integration</h3><p>Recruiter replies are detected and attached to the right application automatically.</p><a className="more" href="#how-it-works">Learn more <ArrowRight className="ic ic-sm" /></a></div>
            <div className="card feature"><span className="icon-tile"><Calendar className="ic ic-lg" /></span><h3>Google Calendar Integration</h3><p>Interviews sync both ways with prep notes and links added to every event.</p><a className="more" href="#how-it-works">Learn more <ArrowRight className="ic ic-sm" /></a></div>
            <div className="card feature"><span className="icon-tile"><Users className="ic ic-lg" /></span><h3>Interview Management</h3><p>Rounds, interviewers, feedback and follow-ups — organised per company.</p><a className="more" href="#how-it-works">Learn more <ArrowRight className="ic ic-sm" /></a></div>
            <div className="card feature"><span className="icon-tile"><Bot className="ic ic-lg" /></span><h3>AI Career Assistant</h3><p>Ask anything: salary benchmarks, cover letters, mock interview questions and more.</p><a className="more" href="#how-it-works">Learn more <ArrowRight className="ic ic-sm" /></a></div>
            <div className="card feature-cta">
              <LeafShape className="leaf" style={{ right: "-30px", bottom: "-40px", width: "160px", height: "160px", color: "#0B5C47", transform: "rotate(-30deg)" }} />
              <div style={{ position: "relative" }}><h3>Ready to job hunt smarter?</h3><p>Set up your profile in under 3 minutes.</p></div>
              <Link className="btn btn-sm" style={{ position: "relative" }} href="/signup">Get Started <ArrowRight className="ic ic-sm" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how" id="how-it-works">
        <SprigShape className="leaf" style={{ top: "40px", right: "40px", width: "90px", height: "150px", color: "#CFE3D5", transform: "rotate(-20deg)" }} />
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How It Works</span>
            <h2>From sign-up to offer in <span className="hl">5 simple steps</span></h2>
            <p>JobAI does the heavy lifting while you stay in control of every decision.</p>
          </div>
          <div className="timeline">
            <div className="step"><div className="step-dot"><UserPlus className="ic ic-lg" /><span className="step-num">1</span></div><div className="step-card"><h4>Sign up</h4><p>Create your free account with Google, LinkedIn or email.</p></div></div>
            <div className="step"><div className="step-dot"><Upload className="ic ic-lg" /><span className="step-num">2</span></div><div className="step-card"><h4>Upload resume</h4><p>Drop in a PDF or DOCX — we parse skills and experience.</p></div></div>
            <div className="step"><div className="step-dot"><UserCheck className="ic ic-lg" /><span className="step-num">3</span></div><div className="step-card"><h4>Review profile</h4><p>Confirm roles, salary range and preferred locations.</p></div></div>
            <div className="step"><div className="step-dot"><Target className="ic ic-lg" /><span className="step-num">4</span></div><div className="step-card"><h4>Get matches</h4><p>Receive ranked jobs with a tailored resume for each.</p></div></div>
            <div className="step"><div className="step-dot"><Calendar className="ic ic-lg" /><span className="step-num">5</span></div><div className="step-card"><h4>Track &amp; interview</h4><p>Follow progress and prep for interviews in one place.</p></div></div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Integrations</span>
            <h2>Works with the tools <span className="hl">you already use</span></h2>
            <p>Connect once and JobAI keeps your inbox, calendar and profile in sync automatically.</p>
          </div>
          <div className="integr-grid">
            <div className="card integr">
              <div className="integr-top"><span className="brand-tile"><Mail className="ic ic-lg" /></span><span className="status"><i></i>Connected</span></div>
              <h3>Gmail</h3><p>Detect recruiter emails and application updates without lifting a finger.</p>
              <ul><li><CircleCheck className="ic ic-sm" />Auto-link replies to applications</li><li><CircleCheck className="ic ic-sm" />Read-only access to job emails</li></ul>
              <Link className="btn btn-ghost btn-sm" href="/login">Manage <ArrowRight className="ic ic-sm" /></Link>
            </div>
            <div className="card integr">
              <div className="integr-top"><span className="brand-tile"><Calendar className="ic ic-lg" /></span><span className="status"><i></i>Connected</span></div>
              <h3>Google Calendar</h3><p>Interviews appear on your calendar with prep notes and meeting links.</p>
              <ul><li><CircleCheck className="ic ic-sm" />Two-way interview sync</li><li><CircleCheck className="ic ic-sm" />Smart reminders 24h &amp; 1h before</li></ul>
              <Link className="btn btn-ghost btn-sm" href="/login">Manage <ArrowRight className="ic ic-sm" /></Link>
            </div>
            <div className="card integr">
              <div className="integr-top"><span className="brand-tile"><LinkedinBrandIcon className="ic ic-lg ic-fill" style={{ width: "22px", height: "22px" }} /></span><span className="status off"><i></i>Not connected</span></div>
              <h3>LinkedIn</h3><p>Import your experience in one click and discover roles in your network.</p>
              <ul><li><CircleCheck className="ic ic-sm" />One-click profile import</li><li><CircleCheck className="ic ic-sm" />Referral opportunities</li></ul>
              <Link className="btn btn-primary btn-sm" href="/signup">Connect <span className="arrow"><ArrowRight className="ic ic-xs" /></span></Link>
            </div>
          </div>
          <div className="secure">
            <span className="icon-tile"><ShieldCheck className="ic ic-lg" /></span>
            <div><b>Secure OAuth 2.0 — we never see your passwords</b><p>Revoke access anytime. Data is encrypted in transit and at rest, and never sold to third parties.</p></div>
            <div className="chips"><span className="pill">OAuth 2.0</span><span className="pill">AES-256</span><span className="pill">GDPR ready</span></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ paddingTop: "24px" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Testimonials</span>
            <h2>Loved by <span className="hl">12,000+ job seekers</span></h2>
          </div>
          <div className="testi-grid">
            <div className="card testi">
              <Quote className="ic quote ic-fill" style={{ width: "32px", height: "32px" }} />
              <blockquote>“I applied to 40 roles in two weeks with a tailored resume for each one. Landed three interviews and an offer at Google within a month.”</blockquote>
              <div className="person"><span className="av" style={{ background: "#086B50" }}>PS</span><div><b>Priya Sharma</b><small>UX Designer · Google</small></div><span className="stars"><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /></span></div>
            </div>
            <div className="card testi featured">
              <Quote className="ic quote ic-fill" style={{ width: "32px", height: "32px" }} />
              <blockquote>“The Gmail and Calendar sync is magic. Every recruiter email and interview just shows up in the right place. I finally stopped using spreadsheets.”</blockquote>
              <div className="person"><span className="av" style={{ background: "#15966D" }}>MC</span><div><b>Marcus Chen</b><small>Product Manager · Microsoft</small></div><span className="stars"><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /></span></div>
            </div>
            <div className="card testi">
              <Quote className="ic quote ic-fill" style={{ width: "32px", height: "32px" }} />
              <blockquote>“As a career switcher, the AI assistant helped me reframe my experience. My response rate went from 5% to over 30%.”</blockquote>
              <div className="person"><span className="av" style={{ background: "#B7793A" }}>EO</span><div><b>Emily Okafor</b><small>Data Analyst · Amazon</small></div><span className="stars"><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /><Star className="ic ic-xs ic-fill" /></span></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ paddingTop: "24px" }}>
        <div className="container faq-wrap">
          <div className="intro">
            <span className="eyebrow">FAQ</span>
            <h2>Questions? <span className="hl">We’ve got answers.</span></h2>
            <p>Everything you need to know about JobAI. Can’t find what you’re looking for? Our team is happy to help.</p>
            <div className="help-card">
              <b>Still have questions?</b>
              <p>Chat with our support team — average reply time under 5 minutes.</p>
              <a className="btn btn-primary btn-sm" href={SUPPORT_HREF}>Contact Support <span className="arrow"><ArrowRight className="ic ic-xs" /></span></a>
            </div>
          </div>
          <div className="faq">
            <div className="card faq-item open"><div className="faq-q">Is JobAI free to use?<span className="tog"><Minus className="ic ic-sm" /></span></div><p className="faq-a">Yes. The Free plan includes 20 AI-tailored resumes per month, unlimited application tracking and Gmail &amp; Calendar sync. Pro unlocks unlimited resumes and the AI career assistant.</p></div>
            <div className="card faq-item open"><div className="faq-q">How does JobAI tailor my resume?<span className="tog"><Minus className="ic ic-sm" /></span></div><p className="faq-a">We compare your experience against each job description, then reorder highlights, surface missing keywords and rewrite bullet points — you review every change before applying.</p></div>
            <div className="card faq-item open"><div className="faq-q">Is my Gmail and Calendar data safe?<span className="tog"><Minus className="ic ic-sm" /></span></div><p className="faq-a">We use Google OAuth 2.0 with read-only scopes limited to job-related emails. We never see your password, and you can disconnect at any time from Settings.</p></div>
            <div className="card faq-item open"><div className="faq-q">Does JobAI apply to jobs on my behalf?<span className="tog"><Minus className="ic ic-sm" /></span></div><p className="faq-a">Only if you enable Auto-Apply. By default JobAI prepares everything and you submit with one click, so you stay in full control.</p></div>
            <div className="card faq-item open"><div className="faq-q">Can I cancel my Pro subscription anytime?<span className="tog"><Minus className="ic ic-sm" /></span></div><p className="faq-a">Absolutely. Cancel in two clicks from Billing — you keep Pro features until the end of your billing period.</p></div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <div className="cta-band">
        <LeafShape className="leaf" style={{ right: "260px", top: "-60px", width: "220px", height: "220px", color: "rgba(255,255,255,.06)", transform: "rotate(40deg)" }} />
        <div style={{ position: "relative" }}><h2>Start your smarter job search <span>today</span></h2><p>Free forever plan · No credit card required</p></div>
        <Link className="btn btn-primary" style={{ position: "relative" }} href="/signup">Get Started Free <span className="arrow"><ArrowRight className="ic ic-sm" /></span></Link>
      </div>

      {/* Footer */}
      <footer className="footer">
        <LeafShape className="leaf" style={{ right: "-40px", bottom: "-60px", width: "260px", height: "260px", color: "rgba(255,255,255,.04)", transform: "rotate(-25deg)" }} />
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="logo"><span className="logo-mark"><Sparkles className="ic" /></span><span>Job<b>AI</b></span></div>
              <p>Your personal AI job application assistant. Find, apply and get hired faster.</p>
              <div className="socials"><span><LinkedinIcon className="ic ic-sm" /></span><span><Mail className="ic ic-sm" /></span><span><Globe className="ic ic-sm" /></span></div>
            </div>
            <div><h5>Product</h5><ul><li>Features</li><li>Pricing</li><li>Integrations</li><li>Changelog</li></ul></div>
            <div><h5>Company</h5><ul><li>About</li><li>Careers</li><li>Blog</li><li>Contact</li></ul></div>
            <div><h5>Resources</h5><ul><li>Help Center</li><li>Resume Guide</li><li>Interview Tips</li><li>Community</li></ul></div>
            <div><h5>Stay in the loop</h5><ul><li style={{ marginBottom: "6px" }}>Weekly job-search tips, no spam.</li></ul><div className="newsletter"><span>you@email.com</span><b>Subscribe <ArrowRight className="ic ic-xs" /></b></div></div>
          </div>
          <div className="footer-bottom"><span>© 2026 JobAI Inc. All rights reserved.</span><div><span>Privacy Policy</span><span>Terms of Service</span><span>Cookies</span></div></div>
        </div>
      </footer>
    </main>
  );
}
