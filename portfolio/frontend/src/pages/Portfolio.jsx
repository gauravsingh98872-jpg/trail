import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Portfolio.css';

const API = process.env.REACT_APP_API_URL || 'https://trail-tpcd.onrender.com';

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useScrollReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px', ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Reveal Wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, direction = 'up', className = '' }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal reveal-${direction} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Portfolio() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [darkMode, setDarkMode]     = useState(false);
  const [form, setForm]             = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState(null);
  const [formError, setFormError]   = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Dark mode toggle effect ──────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    axios.get(`${API}/api/portfolio`, {
      headers: { 'Accept': 'application/json' },
      timeout: 15000,
    })
      .then(r => {
        if (typeof r.data === 'string' && r.data.includes('<!doctype')) {
          setError('Backend not responding correctly.');
        } else {
          setData(r.data);
        }
        setLoading(false);
      })
      .catch(err => {
        if (err.code === 'ECONNABORTED') {
          setError('Backend timeout – try again in 1–2 minutes.');
        } else if (err.response) {
          setError(`Server Error: ${err.response.status}`);
        } else {
          setError('Network error – unable to connect.');
        }
        setLoading(false);
      });
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())    return setFormError('Name is required.');
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
                              return setFormError('Valid email required.');
    if (!form.message.trim()) return setFormError('Message is required.');
    setFormStatus('sending');
    try {
      await axios.post(`${API}/api/contact`, form, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      setFormStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setFormStatus('error');
      setFormError(err.response?.data?.error || 'Could not send message. Try again.');
    }
  };

  if (loading) return (
    <div className="loader-screen">
      <div className="loader-ring"></div>
      <p className="loader-text">Loading Portfolio…</p>
      <p className="loader-sub">First load may take 30–60 sec (Render free tier)</p>
    </div>
  );

  if (error) return (
    <div className="loader-screen">
      <p className="loader-error">⚠️ {error}</p>
      <button className="retry-btn" onClick={() => { setLoading(true); setError(null); window.location.reload(); }}>
        Retry
      </button>
    </div>
  );

  if (!data) return <div className="loader-screen"><p>No data found.</p></div>;

  return (
    <div className="pf-root">

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav className={`pf-nav ${scrolled ? 'pf-nav-scrolled' : ''}`}>
        <div className="nav-inner">
          <span className="pf-nav-logo">
            <span className="logo-bracket">&lt;</span>GS<span className="logo-bracket">/&gt;</span>
          </span>
          <button className="pf-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className={menuOpen ? 'bar open' : 'bar'}></span>
            <span className={menuOpen ? 'bar open' : 'bar'}></span>
            <span className={menuOpen ? 'bar open' : 'bar'}></span>
          </button>
          <div className={`pf-nav-links ${menuOpen ? 'nav-open' : ''}`}>
            <a href="#about"     onClick={() => setMenuOpen(false)}>About</a>
            <a href="#skills"    onClick={() => setMenuOpen(false)}>Skills</a>
            <a href="#education" onClick={() => setMenuOpen(false)}>Education</a>
            <a href="#projects"  onClick={() => setMenuOpen(false)}>Projects</a>
            <a href="#contact"   onClick={() => setMenuOpen(false)}>Contact</a>
            <a href="/admin/login" className="nav-cta" onClick={() => setMenuOpen(false)}>Admin ↗</a>

            {/* ── DARK / LIGHT TOGGLE ──────────────────────────────────── */}
            <button
              className="theme-toggle-btn"
              onClick={() => { setDarkMode(!darkMode); setMenuOpen(false); }}
              aria-label="Toggle theme"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                /* Sun icon — light mode ke liye */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="4.5" stroke="#f26522" strokeWidth="2"/>
                  <line x1="12" y1="2"  x2="12" y2="5"  stroke="#f26522" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="19" x2="12" y2="22" stroke="#f26522" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="2"  y1="12" x2="5"  y2="12" stroke="#f26522" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="19" y1="12" x2="22" y2="12" stroke="#f26522" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"  stroke="#f26522" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#f26522" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="19.78" y1="4.22"  x2="17.66" y2="6.34"  stroke="#f26522" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6.34"  y1="17.66" x2="4.22"  y2="19.78" stroke="#f26522" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                /* Moon icon — dark mode ke liye */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
                    fill="#0d0f14"
                    stroke="#0d0f14"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="pf-hero" id="about">
        <div className="hero-blob hero-blob-1"></div>
        <div className="hero-blob hero-blob-2"></div>
        <div className="hero-inner">
          <div className="hero-content hero-anim-left">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot"></span>
              Software Engineer
            </div>
            <h1 className="hero-title">
              Building{' '}
              <span className="title-accent">Innovative</span>
              <br />
              Digital Solutions
            </h1>
            <p className="hero-bio">{data.summary}</p>
            <p className="hero-loc">📍 {data.location}</p>
            <div className="hero-actions">
              <a href="#contact"  className="btn btn-primary">Start a Conversation →</a>
              <a href="#projects" className="btn btn-ghost">View My Work</a>
            </div>
          </div>
          <div className="hero-visual hero-anim-right">
            <div className="avatar-wrap">
              <div className="avatar-glow"></div>
              <div className="avatar-ring">
                <div className="avatar-inner">
                  <img src="/gaurav.png" alt={data.name} />
                </div>
              </div>
              <div className="floating-pill fp1">⚡ Python Expert</div>
              <div className="floating-pill fp2">🚀 Full Stack</div>
              <div className="floating-pill fp3">🍃 MongoDB</div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>Scroll to explore</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* ── STATS COUNTER ────────────────────────────────────────────────── */}
      <section className="pf-stats">
        <div className="stats-inner">
          {[
            { value: (data.projects || []).length || 8, suffix: '+', label: 'Projects Built' },
            { value: (data.skills   || []).length || 15, suffix: '+', label: 'Technologies' },
            { value: (data.certificates || []).length || 5, suffix: '+', label: 'Certifications' },
            { value: 2, suffix: '+',  label: 'Years Experience' },
          ].map((s, i) => (
            <Reveal key={i} direction="up" delay={i * 100}>
              <div className="stat-card">
                <div className="stat-number">
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ABOUT HIGHLIGHT ──────────────────────────────────────────────── */}
      <section className="pf-about-highlight">
        <div className="about-inner">
          <Reveal direction="left">
            <div className="about-left">
              <div className="section-eyebrow">About Me</div>
              <h2 className="section-heading">
                Pioneering the Next<br />
                Era of <span className="text-accent">Digital Excellence</span>
              </h2>
              <p className="about-desc">{data.summary}</p>
              <ul className="about-bullets">
                <li><span className="bullet-dot"></span>Full Stack Development</li>
                <li><span className="bullet-dot"></span>AI & Data Solutions</li>
                <li><span className="bullet-dot"></span>Clean, Scalable Code</li>
              </ul>
            </div>
          </Reveal>
          <div className="about-right">
            {[
              { icon: '🛡️', title: '100% Trust', desc: 'Transparent delivery and accountability' },
              { icon: '⚡', title: 'Ultra Speed', desc: 'Rapid development and optimisation' },
              { icon: '📊', title: 'Data Insight', desc: 'Analytics-driven decision making' },
              { icon: '🌐', title: 'Global Ready', desc: 'Scalable architecture from day one' },
            ].map((card, i) => (
              <Reveal key={i} direction="up" delay={i * 80}>
                <div className="feature-card">
                  <div className="feature-icon">{card.icon}</div>
                  <div>
                    <h4 className="feature-title">{card.title}</h4>
                    <p className="feature-desc">{card.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILLS ───────────────────────────────────────────────────────── */}
      <section className="pf-section pf-section-gray" id="skills">
        <div className="section-inner">
          <Reveal direction="up">
            <div className="section-eyebrow">Technical Arsenal</div>
            <h2 className="section-heading">Skills & <span className="text-accent">Expertise</span></h2>
          </Reveal>
          <div className="skills-grid">
            {(data.skills || []).map((s, i) => (
              <Reveal key={i} direction="up" delay={i * 50}>
                <div className="skill-pill">
                  <div className="skill-pill-dot"></div>
                  <span className="skill-pill-name">{s.name}</span>
                  <span className="skill-pill-level">{s.level}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ────────────────────────────────────────────────────── */}
      <section className="pf-section" id="education">
        <div className="section-inner">
          <Reveal direction="up">
            <div className="section-eyebrow">Academic Journey</div>
            <h2 className="section-heading">Education & <span className="text-accent">Qualifications</span></h2>
          </Reveal>
          <div className="edu-grid">
            {(data.education || []).map((e, i) => (
              <Reveal key={i} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 120}>
                <div className="edu-card">
                  <div className="edu-year">{e.startYear} – {e.endYear}</div>
                  <h3 className="edu-degree">{e.degree}</h3>
                  <p className="edu-inst">{e.institution}</p>
                  <p className="edu-field">{e.field}</p>
                  <div className="edu-score">
                    <span>Score</span>
                    <strong>{e.percentage}%</strong>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ─────────────────────────────────────────────────────── */}
      <section className="pf-section pf-section-gray" id="projects">
        <div className="section-inner">
          <Reveal direction="up">
            <div className="section-eyebrow">What I've Built</div>
            <h2 className="section-heading">Featured <span className="text-accent">Projects</span></h2>
          </Reveal>
          <div className="projects-grid">
            {(data.projects || []).map((p, i) => (
              <Reveal key={i} direction="up" delay={i * 90}>
                <div className="project-card">
                  <div className="project-index">0{i + 1}</div>
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-desc">{p.description}</p>
                  <div className="project-tags">
                    {(p.tech || []).map((t, j) => (
                      <span key={j} className="tag">{t}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATES ─────────────────────────────────────────────────── */}
      <section className="pf-section">
        <div className="section-inner">
          <Reveal direction="up">
            <div className="section-eyebrow">Credentials</div>
            <h2 className="section-heading">Certificates & <span className="text-accent">Awards</span></h2>
          </Reveal>
          <div className="certs-grid">
            {(data.certificates || []).map((c, i) => (
              <Reveal key={i} direction="up" delay={i * 70}>
                <div className="cert-card">
                  <div className="cert-badge">🏆</div>
                  <div>
                    <p className="cert-name">{c.name}</p>
                    <p className="cert-by">{c.issuer}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LANGUAGES & HOBBIES ──────────────────────────────────────────── */}
      <section className="pf-section pf-section-gray">
        <div className="section-inner two-col">
          <Reveal direction="left">
            <div>
              <div className="section-eyebrow">Languages</div>
              <h2 className="section-heading small">I <span className="text-accent">Speak</span></h2>
              {(data.languages || []).map((l, i) => (
                <div className="lang-row" key={i}>
                  <span className="lang-name">{l.name}</span>
                  <span className="lang-badge">{l.level}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal direction="right" delay={100}>
            <div>
              <div className="section-eyebrow">Beyond Code</div>
              <h2 className="section-heading small">My <span className="text-accent">Interests</span></h2>
              <div className="hobbies-wrap">
                {(data.hobbies || []).map((h, i) => (
                  <span key={i} className="hobby-chip">{h}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section className="pf-section pf-contact" id="contact">
        <div className="section-inner">
          <Reveal direction="up">
            <div className="section-eyebrow center">Let's Connect</div>
            <h2 className="section-heading center">
              Ready to <span className="text-accent">Work Together?</span>
            </h2>
            <p className="contact-sub">Drop a message — I'll reply within 24 hours 🚀</p>
          </Reveal>

          <div className="contact-cards">
            {[
              { icon: '✉️', label: 'Email', value: data.email, href: `mailto:${data.email}` },
              { icon: '📞', label: 'Phone', value: data.phone, href: `tel:${data.phone}` },
              { icon: '📍', label: 'Location', value: data.location, href: null },
            ].map((c, i) => (
              <Reveal key={i} direction="up" delay={i * 80}>
                {c.href
                  ? <a href={c.href} className="contact-card"><span className="cc-icon">{c.icon}</span><div><p className="cc-label">{c.label}</p><p className="cc-value">{c.value}</p></div></a>
                  : <div className="contact-card"><span className="cc-icon">{c.icon}</span><div><p className="cc-label">{c.label}</p><p className="cc-value">{c.value}</p></div></div>
                }
              </Reveal>
            ))}
          </div>

          <Reveal direction="up" delay={120}>
            <div className="contact-form-box">
              <h3 className="form-title">Send a Message</h3>

              {formStatus === 'success' ? (
                <div className="form-success">
                  <div className="success-icon">✅</div>
                  <h4>Message Sent!</h4>
                  <p>Thanks {form.name || 'there'}! I'll be in touch soon.</p>
                  <button className="btn btn-ghost" style={{ marginTop: '16px' }} onClick={() => setFormStatus(null)}>
                    Send Another
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleFormSubmit} noValidate>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name <span className="req">*</span></label>
                      <input type="text" name="name" placeholder="Your name"
                        value={form.name} onChange={handleFormChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label>Email <span className="req">*</span></label>
                      <input type="email" name="email" placeholder="you@example.com"
                        value={form.email} onChange={handleFormChange} className="form-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Phone (Optional)</label>
                    <input type="tel" name="phone" placeholder="+91 98765 43210"
                      value={form.phone} onChange={handleFormChange} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Message <span className="req">*</span></label>
                    <textarea name="message" rows={5}
                      placeholder="Tell me about your project or idea..."
                      value={form.message} onChange={handleFormChange}
                      className="form-input form-textarea" />
                  </div>
                  {formError && <p className="form-error">⚠️ {formError}</p>}
                  <button type="submit" className="btn btn-primary btn-full" disabled={formStatus === 'sending'}>
                    {formStatus === 'sending'
                      ? <><span className="btn-spinner"></span> Sending…</>
                      : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="pf-footer">
        <div className="footer-inner">
          <span className="footer-logo">
            <span className="logo-bracket">&lt;</span>GS<span className="logo-bracket">/&gt;</span>
          </span>
          <p>© 2026 {data.name} · Designed with passion</p>
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}