import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, User, Phone, Mail, MapPin } from 'lucide-react'
import { api, formatCurrency, formatDate } from '../services/api'
import { useToastStore } from '../stores/toastStore'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, customer: null })
  const { addToast } = useToastStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCustomers()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [search])

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      const response = await api.get(`/customers?${params.toString()}`)
      setCustomers(response.data)
    } catch (error) {
      addToast('Failed to load customers', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditCustomer(customer)
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || ''
      })
    } else {
      setEditCustomer(null)
      setFormData({ name: '', email: '', phone: '', address: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editCustomer) {
        await api.put(`/customers/${editCustomer._id}`, formData)
        addToast('Customer updated successfully', 'success')
      } else {
        await api.post('/customers', formData)
        addToast('Customer created successfully', 'success')
      }
      setShowModal(false)
      fetchCustomers()
    } catch (error) {
      addToast('Failed to save customer', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.customer) return
    try {
      await api.delete(`/customers/${deleteModal.customer._id}`)
      addToast('Customer deleted successfully', 'success')
      fetchCustomers()
    } catch (error) {
      addToast('Failed to delete customer', 'error')
    } finally {
      setDeleteModal({ show: false, customer: null })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="header-title">Customers</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Purchases</th>
                  <th>Member Since</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--accent-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{customer.name}</div>
                          {customer.address && (
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {customer.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {customer.email ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <Mail size={14} />
                          {customer.email}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      {customer.phone ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <Phone size={14} />
                          {customer.phone}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <span className="badge badge-success">{customer.totalPurchases} orders</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(customer.createdAt)}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(customer)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal({ show: true, customer })}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                      No customers found
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
              <h3 className="modal-title">{editCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
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
                    placeholder="Customer name"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@email.com"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Address</label>
                  <textarea
                    className="input-field"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Customer address"
                    rows="2"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, customer: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Customer</h3>
              <button className="modal-close" onClick={() => setDeleteModal({ show: false, customer: null })}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteModal.customer?.name}</strong>?</p>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, customer: null })}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
