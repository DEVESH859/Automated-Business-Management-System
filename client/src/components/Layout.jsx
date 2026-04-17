import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toasts } = useToastStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const role = user?.role || 'staff'

  const allNavItems = [
    { path: '/',           icon: LayoutDashboard, label: 'Dashboard',  minRole: 'staff'   },
    { path: '/pos',        icon: ShoppingCart,    label: 'Sales',      minRole: 'staff'   },
    { path: '/inventory',  icon: Package,         label: 'Inventory',  minRole: 'staff'   },
    { path: '/customers',  icon: Users,           label: 'Customers',  minRole: 'manager' },
    { path: '/reports',    icon: BarChart3,       label: 'Reports',    minRole: 'manager' },
    { path: '/employees',  icon: UserCog,         label: 'Employees',  minRole: 'admin'   },
    { path: '/settings',   icon: Settings,        label: 'Settings',   minRole: 'admin'   },
  ]

  const ROLE_LEVELS = { admin: 3, manager: 2, staff: 1 }
  const navItems = allNavItems.filter(
    item => (ROLE_LEVELS[role] || 0) >= (ROLE_LEVELS[item.minRole] || 0)
  )

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <LayoutDashboard size={28} />
            <span>ABMS</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-menu" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="header-actions">
            <div className="user-menu">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">{user?.role || 'Staff'}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>

      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
