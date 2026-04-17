import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, User, Shield } from 'lucide-react'
import { api } from '../services/api'
import { useToastStore } from '../stores/toastStore'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editEmployee, setEditEmployee] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, employee: null })
  const { addToast } = useToastStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees')
      setEmployees(response.data)
    } catch (error) {
      addToast('Failed to load employees', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditEmployee(employee)
      setFormData({
        name: employee.name,
        email: employee.email,
        password: '',
        role: employee.role
      })
    } else {
      setEditEmployee(null)
      setFormData({ name: '', email: '', password: '', role: 'staff' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...formData }
      if (!data.password) delete data.password

      if (editEmployee) {
        await api.put(`/employees/${editEmployee._id}`, data)
        addToast('Employee updated successfully', 'success')
      } else {
        await api.post('/employees', data)
        addToast('Employee created successfully', 'success')
      }
      setShowModal(false)
      fetchEmployees()
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to save employee', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.employee) return
    try {
      await api.delete(`/employees/${deleteModal.employee._id}`)
      addToast('Employee deleted successfully', 'success')
      fetchEmployees()
    } catch (error) {
      addToast('Failed to delete employee', 'error')
    } finally {
      setDeleteModal({ show: false, employee: null })
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'badge-danger',
      manager: 'badge-warning',
      staff: 'badge-info'
    }
    return styles[role] || 'badge-info'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="header-title">Employees</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: employee.role === 'admin' ? 'var(--accent-red)' : 'var(--accent-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600
                        }}>
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{employee.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{employee.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(employee.role)}`}>
                        <Shield size={12} style={{ marginRight: '4px' }} />
                        {employee.role}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(employee)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal({ show: true, employee })}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Employee name"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Email *</label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="employee@company.com"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{editEmployee ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                  <input
                    type="password"
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editEmployee}
                    placeholder="Enter password"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Role *</label>
                  <select
                    className="input-field"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editEmployee ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, employee: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Employee</h3>
              <button className="modal-close" onClick={() => setDeleteModal({ show: false, employee: null })}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteModal.employee?.name}</strong>?</p>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, employee: null })}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
