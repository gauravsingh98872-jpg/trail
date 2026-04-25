import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate('/admin');
  }, [isLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, form);
      login(res.data.token, res.data.username);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Background decoration */}
      <div className="login-bg-blob login-blob-1"></div>
      <div className="login-bg-blob login-blob-2"></div>

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo">
            <span className="logo-lt">&lt;</span>GS<span className="logo-lt">/&gt;</span>
          </div>
        </div>

        {/* Header */}
        <h1 className="login-title">Admin Portal</h1>
        <p className="login-subtitle">Sign in to manage your portfolio</p>

        {/* Error */}
        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="login-form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="login-password">Password</label>
            <div className="pwd-wrap">
              <input
                id="login-password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd(!showPwd)}
                tabIndex={-1}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-btn ${loading ? 'login-btn-loading' : ''}`}
            disabled={loading}
          >
            {loading
              ? <><span className="login-spinner"></span> Signing in…</>
              : 'Sign In →'
            }
          </button>
        </form>

        <a href="/" className="login-back">← Back to Portfolio</a>
      </div>
    </div>
  );
}