import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Eye, EyeOff, Shield, Users, UserCheck, ArrowLeft, UserPlus, LogIn } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { api } from '../services/api'

const ROLES = [
  {
    role: 'admin',
    label: 'Admin',
    icon: Shield,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.13)',
    border: 'rgba(99,102,241,0.45)',
    glow: 'rgba(99,102,241,0.25)',
    description: 'Full access to all modules',
    perms: ['Dashboard', 'Inventory', 'Sales', 'Customers', 'Employees', 'Reports', 'Settings'],
  },
  {
    role: 'manager',
    label: 'Manager',
    icon: UserCheck,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.11)',
    border: 'rgba(34,197,94,0.4)',
    glow: 'rgba(34,197,94,0.20)',
    description: 'Manages sales, inventory & customers',
    perms: ['Dashboard', 'Inventory', 'Sales', 'Customers', 'Reports'],
  },
  {
    role: 'staff',
    label: 'Staff',
    icon: Users,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.11)',
    border: 'rgba(245,158,11,0.4)',
    glow: 'rgba(245,158,11,0.20)',
    description: 'Handles daily sales & inventory',
    perms: ['Dashboard', 'Sales', 'Inventory'],
  },
]

export default function Login() {
  const [step, setStep] = useState('role') // 'role' | 'auth'
  const [selectedRole, setSelectedRole] = useState(null)
  const [mode, setMode] = useState('signin') // 'signin' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleRoleSelect = (r) => {
    setSelectedRole(r)
    setStep('auth')
    setError('')
    setName('')
    setEmail('')
    setPassword('')
    setMode('signin')
  }

  const handleBack = () => {
    setStep('role')
    setSelectedRole(null)
    setError('')
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Invalid credentials')
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Please enter your name'); return }
    setLoading(true)
    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole.role,
      })
      // auto login after register
      const result = await login(email.trim(), password)
      if (result.success) {
        navigate('/')
      } else {
        setError('Account created! Please sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed')
    }
    setLoading(false)
  }

  const role = selectedRole

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 20% 40%, ${role ? role.bg : 'rgba(99,102,241,0.10)'} 0%, transparent 55%),
                   radial-gradient(ellipse at 80% 70%, rgba(34,197,94,0.07) 0%, transparent 50%),
                   var(--bg-primary)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ width: '100%', maxWidth: step === 'role' ? '560px' : '420px', transition: 'max-width 0.3s ease' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '12px', padding: '10px',
              boxShadow: '0 0 28px rgba(99,102,241,0.45)',
            }}>
              <LayoutDashboard size={26} color="#fff" />
            </div>
            <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>ABMS</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            {step === 'role' ? 'Choose your role to continue' : `Signing in as ${role?.label}`}
          </p>
        </div>

        {/* ── STEP 1: Role Selection ── */}
        {step === 'role' && (
          <div>
            <p style={{
              textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px',
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px',
            }}>Select your role</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ROLES.map((r) => {
                const Icon = r.icon
                return (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSelect(r)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      background: 'var(--bg-secondary)',
                      border: `1.5px solid var(--border)`,
                      borderRadius: '16px', padding: '18px 20px',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = r.border
                      e.currentTarget.style.background = r.bg
                      e.currentTarget.style.transform = 'translateX(4px)'
                      e.currentTarget.style.boxShadow = `0 8px 32px ${r.glow}`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                      e.currentTarget.style.transform = 'translateX(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                      background: r.bg, border: `1.5px solid ${r.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={22} color={r.color} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.label}</span>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                          background: r.bg, color: r.color, border: `1px solid ${r.border}`,
                        }}>{r.role.toUpperCase()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{r.description}</p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {r.perms.map(p => (
                          <span key={p} style={{
                            fontSize: '10px', padding: '2px 7px', borderRadius: '6px',
                            background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                          }}>{p}</span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ color: 'var(--text-muted)', fontSize: '20px' }}>›</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: Auth Form ── */}
        {step === 'auth' && role && (
          <div>
            {/* Back + Role badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '8px', cursor: 'pointer',
                  color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = role.border}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <ArrowLeft size={16} />
              </button>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', flex: 1,
                background: role.bg, border: `1px solid ${role.border}`,
                borderRadius: '10px', padding: '8px 14px',
              }}>
                <role.icon size={16} color={role.color} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: role.color }}>{role.label}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                  {role.description}
                </span>
              </div>
            </div>

            {/* Sign In / Register Tabs */}
            <div style={{
              display: 'flex', background: 'var(--bg-secondary)',
              border: '1px solid var(--border)', borderRadius: '12px', padding: '4px',
              marginBottom: '20px',
            }}>
              {[
                { key: 'signin', label: 'Sign In', icon: LogIn },
                { key: 'register', label: 'Create Account', icon: UserPlus },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setMode(tab.key); setError('') }}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', padding: '10px', borderRadius: '9px', border: 'none',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    transition: 'all 0.2s ease',
                    background: mode === tab.key
                      ? `linear-gradient(135deg, ${role.color}22, ${role.color}11)`
                      : 'transparent',
                    color: mode === tab.key ? role.color : 'var(--text-secondary)',
                    boxShadow: mode === tab.key ? `0 0 0 1px ${role.border}` : 'none',
                  }}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Card */}
            <div style={{
              background: 'var(--bg-secondary)', border: `1px solid var(--border)`,
              borderRadius: '20px', padding: '28px',
              boxShadow: `0 20px 60px ${role.glow}`,
            }}>
              {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

              <form
                onSubmit={mode === 'signin' ? handleSignIn : handleRegister}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                {/* Name (register only) */}
                {mode === 'register' && (
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. John Smith"
                      required
                    />
                  </div>
                )}

                {/* Email */}
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={`your@email.com`}
                    required
                  />
                </div>

                {/* Password */}
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      style={{ paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '13px',
                    borderRadius: '12px', border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: `linear-gradient(135deg, ${role.color}, ${role.color}bb)`,
                    color: '#fff', fontWeight: 700, fontSize: '14px',
                    boxShadow: `0 6px 20px ${role.glow}`,
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1,
                    marginTop: '4px',
                  }}
                >
                  {loading
                    ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                    : (mode === 'signin' ? `Sign In as ${role.label}` : `Create ${role.label} Account`)}
                </button>
              </form>

              {/* Switch mode hint */}
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px', marginBottom: 0 }}>
                {mode === 'signin'
                  ? <>Don't have an account?{' '}
                      <button onClick={() => { setMode('register'); setError('') }}
                        style={{ background: 'none', border: 'none', color: role.color, cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
                        Create one
                      </button>
                    </>
                  : <>Already have an account?{' '}
                      <button onClick={() => { setMode('signin'); setError('') }}
                        style={{ background: 'none', border: 'none', color: role.color, cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
                        Sign in
                      </button>
                    </>
                }
              </p>
            </div>

            {/* Access permissions reminder */}
            <div style={{
              marginTop: '16px', padding: '12px 16px',
              background: 'var(--bg-secondary)', borderRadius: '12px',
              border: '1px solid var(--border)',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {role.label} Access
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {role.perms.map(p => (
                  <span key={p} style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                    background: role.bg, color: role.color,
                    border: `1px solid ${role.border}`,
                  }}>✓ {p}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', marginTop: '24px' }}>
          ABMS · Automated Business Management System
        </p>
      </div>
    </div>
  )
}
