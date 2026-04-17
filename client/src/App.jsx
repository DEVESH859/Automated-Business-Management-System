import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import ProductForm from './pages/ProductForm'
import POS from './pages/POS'
import Customers from './pages/Customers'
import Employees from './pages/Employees'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'

// Role hierarchy: admin > manager > staff
const ROLE_LEVELS = { admin: 3, manager: 2, staff: 1 }

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function RoleRoute({ children, minRole }) {
  const { user } = useAuthStore()
  const userLevel = ROLE_LEVELS[user?.role] || 0
  const requiredLevel = ROLE_LEVELS[minRole] || 0
  if (userLevel < requiredLevel) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* All roles */}
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/new" element={<RoleRoute minRole="manager"><ProductForm /></RoleRoute>} />
          <Route path="inventory/:id/edit" element={<RoleRoute minRole="manager"><ProductForm /></RoleRoute>} />
          {/* Manager + Admin only */}
          <Route path="customers" element={<RoleRoute minRole="manager"><Customers /></RoleRoute>} />
          <Route path="reports" element={<RoleRoute minRole="manager"><Reports /></RoleRoute>} />
          {/* Admin only */}
          <Route path="employees" element={<RoleRoute minRole="admin"><Employees /></RoleRoute>} />
          <Route path="settings" element={<RoleRoute minRole="admin"><Settings /></RoleRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
