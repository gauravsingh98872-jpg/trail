import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const API = '/api/portfolio';

const tabs = [
  { id: 'info',         label: 'Info',        icon: '👤' },
  { id: 'skills',       label: 'Skills',      icon: '⚡' },
  { id: 'education',    label: 'Education',   icon: '🎓' },
  { id: 'projects',     label: 'Projects',    icon: '🚀' },
  { id: 'certificates', label: 'Certificates',icon: '🏆' },
  { id: 'languages',    label: 'Languages',   icon: '🌐' },
  { id: 'hobbies',      label: 'Hobbies',     icon: '❤️' },
  { id: 'messages',     label: 'Messages',    icon: '📩' },
];

export default function Admin() {
  const { token, adminName, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData]           = useState(null);
  const [messages, setMessages]   = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [loading, setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(API).then(r => {
      const d = r.data;
      if (!d) { setLoading(false); return; }
      setData({
        ...d,
        skills:       Array.isArray(d.skills)       ? d.skills       : [],
        education:    Array.isArray(d.education)    ? d.education    : [],
        projects:     Array.isArray(d.projects)     ? d.projects     : [],
        certificates: Array.isArray(d.certificates) ? d.certificates : [],
        languages:    Array.isArray(d.languages)    ? d.languages    : [],
        hobbies:      Array.isArray(d.hobbies)      ? d.hobbies      : [],
      });
      setLoading(false);
    }).catch(err => { console.error('API Error:', err); setLoading(false); });

    if (token) {
      axios.get('/api/messages', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setMessages(Array.isArray(r.data) ? r.data : []))
        .catch(err => console.error('Messages Error:', err.response?.status));
    }
  }, [token]);

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(API, data, { headers });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const updateEdu     = (i, k, v) => { const a = [...data.education];    a[i] = { ...a[i], [k]: v }; setData({ ...data, education: a }); };
  const updateSkill   = (i, k, v) => { const a = [...data.skills];       a[i] = { ...a[i], [k]: v }; setData({ ...data, skills: a }); };
  const updateProject = (i, k, v) => { const a = [...data.projects];     a[i] = { ...a[i], [k]: v }; setData({ ...data, projects: a }); };
  const updateCert    = (i, k, v) => { const a = [...data.certificates]; a[i] = { ...a[i], [k]: v }; setData({ ...data, certificates: a }); };
  const updateLang    = (i, k, v) => { const a = [...data.languages];    a[i] = { ...a[i], [k]: v }; setData({ ...data, languages: a }); };

  if (loading) return (
    <div className="admin-loader">
      <div className="admin-loader-ring"></div>
      <p className="admin-loader-text">Loading Admin Panel…</p>
    </div>
  );

  if (!data) return (
    <div className="admin-loader">
      <p style={{ color: '#dc2626', fontSize: '15px' }}>❌ Portfolio data failed to load.</p>
      <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>Check backend or run seed.js</p>
    </div>
  );

  const activeInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="admin-root">

      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">GS</div>
          <div>
            <p className="sidebar-role">Admin Panel</p>
            <p className="sidebar-name">{adminName}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`sidebar-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
            >
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
              {t.id === 'messages' && messages.length > 0 && (
                <span className="msg-badge">{messages.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="view-portfolio-link" target="_blank" rel="noreferrer">
            ↗ View Portfolio
          </a>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <main className="admin-main">

        {/* Topbar */}
        <div className="admin-topbar">
          <div className="topbar-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span></span><span></span><span></span>
            </button>
            <div className="topbar-title">
              <span className="topbar-icon">{activeInfo?.icon}</span>
              <h1 className="topbar-heading">{activeInfo?.label}</h1>
            </div>
          </div>
          {activeTab !== 'messages' && (
            <button
              className={`save-btn ${saved ? 'save-saved' : ''} ${saving ? 'save-saving' : ''}`}
              onClick={save}
              disabled={saving}
            >
              {saving ? '⏳ Saving…' : saved ? '✅ Saved!' : '💾 Save Changes'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="admin-content">

          {/* ── INFO ──────────────────────────────────────────────── */}
          {activeTab === 'info' && (
            <div className="edit-card">
              <div className="card-header">
                <h2 className="card-title">Basic Information</h2>
                <p className="card-desc">Update your personal details shown on the portfolio</p>
              </div>
              <div className="form-grid-2">
                {[
                  ['name',     'Full Name'],
                  ['title',    'Job Title'],
                  ['location', 'Location'],
                  ['phone',    'Phone'],
                  ['email',    'Email'],
                ].map(([field, lbl]) => (
                  <div className="form-group" key={field}>
                    <label>{lbl}</label>
                    <input
                      value={data[field] || ''}
                      onChange={e => setData({ ...data, [field]: e.target.value })}
                      placeholder={`Enter ${lbl.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Professional Summary</label>
                <textarea rows={5} value={data.summary || ''}
                  onChange={e => setData({ ...data, summary: e.target.value })}
                  placeholder="Write a professional summary…" />
              </div>
            </div>
          )}

          {/* ── SKILLS ────────────────────────────────────────────── */}
          {activeTab === 'skills' && (
            <div className="edit-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Skills</h2>
                  <p className="card-desc">{data.skills.length} skills added</p>
                </div>
                <button className="add-btn"
                  onClick={() => setData({ ...data, skills: [...data.skills, { name: '', level: 'Expert' }] })}>
                  + Add Skill
                </button>
              </div>
              <div className="list-items">
                {data.skills.map((s, i) => (
                  <div className="list-item" key={i}>
                    <span className="list-num">{i + 1}</span>
                    <input placeholder="Skill name" value={s.name}
                      onChange={e => updateSkill(i, 'name', e.target.value)} />
                    <select value={s.level} onChange={e => updateSkill(i, 'level', e.target.value)}>
                      <option>Expert</option><option>Advanced</option>
                      <option>Intermediate</option><option>Beginner</option>
                    </select>
                    <button className="del-btn"
                      onClick={() => setData({ ...data, skills: data.skills.filter((_, j) => j !== i) })}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EDUCATION ─────────────────────────────────────────── */}
          {activeTab === 'education' && (
            <div className="edit-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Education</h2>
                  <p className="card-desc">{data.education.length} entries added</p>
                </div>
                <button className="add-btn"
                  onClick={() => setData({ ...data, education: [...data.education, { degree: '', institution: '', field: '', percentage: '', startYear: '', endYear: '' }] })}>
                  + Add Education
                </button>
              </div>
              {data.education.map((e, i) => (
                <div className="block-card" key={i}>
                  <div className="block-header">
                    <span className="block-label">Education {i + 1}</span>
                    <button className="del-text-btn"
                      onClick={() => setData({ ...data, education: data.education.filter((_, j) => j !== i) })}>
                      ✕ Remove
                    </button>
                  </div>
                  <div className="form-grid-2">
                    {[
                      ['degree',     'Degree'],
                      ['institution','Institution'],
                      ['field',      'Field / Board'],
                      ['percentage', 'Percentage (%)'],
                      ['startYear',  'Start Year'],
                      ['endYear',    'End Year'],
                    ].map(([key, lbl]) => (
                      <div className="form-group" key={key}>
                        <label>{lbl}</label>
                        <input value={e[key] || ''} placeholder={`Enter ${lbl.toLowerCase()}`}
                          onChange={ev => updateEdu(i, key, ev.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PROJECTS ──────────────────────────────────────────── */}
          {activeTab === 'projects' && (
            <div className="edit-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Projects</h2>
                  <p className="card-desc">{data.projects.length} projects added</p>
                </div>
                <button className="add-btn"
                  onClick={() => setData({ ...data, projects: [...data.projects, { title: '', description: '', tech: [] }] })}>
                  + Add Project
                </button>
              </div>
              {data.projects.map((p, i) => (
                <div className="block-card" key={i}>
                  <div className="block-header">
                    <span className="block-label">Project {i + 1}</span>
                    <button className="del-text-btn"
                      onClick={() => setData({ ...data, projects: data.projects.filter((_, j) => j !== i) })}>
                      ✕ Remove
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input value={p.title || ''} placeholder="Project title"
                      onChange={e => updateProject(i, 'title', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows={3} value={p.description || ''} placeholder="Describe your project…"
                      onChange={e => updateProject(i, 'description', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Technologies (comma separated)</label>
                    <input
                      value={Array.isArray(p.tech) ? p.tech.join(', ') : ''}
                      placeholder="React, Node.js, MongoDB…"
                      onChange={e => updateProject(i, 'tech', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CERTIFICATES ──────────────────────────────────────── */}
          {activeTab === 'certificates' && (
            <div className="edit-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Certificates</h2>
                  <p className="card-desc">{data.certificates.length} certificates added</p>
                </div>
                <button className="add-btn"
                  onClick={() => setData({ ...data, certificates: [...data.certificates, { name: '', issuer: '' }] })}>
                  + Add Certificate
                </button>
              </div>
              <div className="list-items">
                {data.certificates.map((c, i) => (
                  <div className="list-item" key={i}>
                    <span className="list-num">{i + 1}</span>
                    <input placeholder="Certificate name" value={c.name || ''}
                      onChange={e => updateCert(i, 'name', e.target.value)} />
                    <input placeholder="Issuer / Organization" value={c.issuer || ''}
                      onChange={e => updateCert(i, 'issuer', e.target.value)} />
                    <button className="del-btn"
                      onClick={() => setData({ ...data, certificates: data.certificates.filter((_, j) => j !== i) })}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LANGUAGES ─────────────────────────────────────────── */}
          {activeTab === 'languages' && (
            <div className="edit-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Languages</h2>
                  <p className="card-desc">{data.languages.length} languages added</p>
                </div>
                <button className="add-btn"
                  onClick={() => setData({ ...data, languages: [...data.languages, { name: '', level: '' }] })}>
                  + Add Language
                </button>
              </div>
              <div className="list-items">
                {data.languages.map((l, i) => (
                  <div className="list-item" key={i}>
                    <span className="list-num">{i + 1}</span>
                    <input placeholder="Language" value={l.name || ''}
                      onChange={e => updateLang(i, 'name', e.target.value)} />
                    <input placeholder="Level (e.g. Native, Fluent)" value={l.level || ''}
                      onChange={e => updateLang(i, 'level', e.target.value)} />
                    <button className="del-btn"
                      onClick={() => setData({ ...data, languages: data.languages.filter((_, j) => j !== i) })}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── HOBBIES ───────────────────────────────────────────── */}
          {activeTab === 'hobbies' && (
            <div className="edit-card">
              <div className="card-header-row">
                <div>
                  <h2 className="card-title">Hobbies & Interests</h2>
                  <p className="card-desc">{data.hobbies.length} hobbies added</p>
                </div>
                <button className="add-btn"
                  onClick={() => setData({ ...data, hobbies: [...data.hobbies, ''] })}>
                  + Add Hobby
                </button>
              </div>
              <div className="list-items">
                {data.hobbies.map((h, i) => (
                  <div className="list-item" key={i}>
                    <span className="list-num">{i + 1}</span>
                    <input placeholder="Hobby / Interest" value={h || ''}
                      onChange={e => {
                        const arr = [...data.hobbies]; arr[i] = e.target.value;
                        setData({ ...data, hobbies: arr });
                      }} />
                    <button className="del-btn"
                      onClick={() => setData({ ...data, hobbies: data.hobbies.filter((_, j) => j !== i) })}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MESSAGES ──────────────────────────────────────────── */}
          {activeTab === 'messages' && (
            <div className="edit-card">
              <div className="card-header">
                <h2 className="card-title">📩 User Messages</h2>
                <p className="card-desc">{messages.length} message{messages.length !== 1 ? 's' : ''} received</p>
              </div>
              {messages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>No messages yet.</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div className="block-card msg-card" key={i}>
                    <div className="block-header">
                      <span className="block-label">Message {i + 1}</span>
                      <span className="msg-time">🕐 {new Date(m.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>👤 Name</label>
                        <input readOnly value={m.name || ''} className="readonly-input" />
                      </div>
                      <div className="form-group">
                        <label>📧 Email</label>
                        <input readOnly value={m.email || ''} className="readonly-input" />
                      </div>
                      <div className="form-group">
                        <label>📞 Phone</label>
                        <input readOnly value={m.phone || 'N/A'} className="readonly-input" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>💬 Message</label>
                      <textarea readOnly rows={3} value={m.message || ''} className="readonly-input" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}