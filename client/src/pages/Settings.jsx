import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'

export default function Settings() {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [storeName, setStoreName] = useState('ABMS - Automated Business Management System')
  const [currency, setCurrency] = useState('INR')
  const [taxRate, setTaxRate] = useState('8')
  const [notifications, setNotifications] = useState(true)

  const handleSave = () => {
    addToast('Settings saved successfully', 'success')
  }

  return (
    <div>
      <h1 className="header-title" style={{ marginBottom: '24px' }}>Settings</h1>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Store Settings</h3>
          </div>
          <div className="card-body">
            <div className="input-group">
              <label className="input-label">Store Name</label>
              <input
                type="text"
                className="input-field"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Currency</label>
              <select
                className="input-field"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">Indian Rupee (Rs.)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Tax Rate (%)</label>
              <input
                type="number"
                className="input-field"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Notifications</h3>
          </div>
          <div className="card-body">
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Enable low stock alerts</span>
              </label>
            </div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Email notifications for new orders</span>
              </label>
            </div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Daily sales summary</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Account Information</h3>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Name</label>
              <input
                type="text"
                className="input-field"
                value={user?.name || ''}
                disabled
              />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input-field"
                value={user?.email || ''}
                disabled
              />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Role</label>
            <input
              type="text"
              className="input-field"
              value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
              disabled
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  )
}
