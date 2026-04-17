import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { api, formatCurrency, formatDate } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, chartRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/chart?period=month')
      ])
      setStats(statsRes.data)
      setChartData(chartRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  const statCards = [
    { label: "Today's Revenue", value: formatCurrency(stats?.revenue?.today || 0), icon: DollarSign, color: 'blue' },
    { label: "Today's Orders", value: stats?.orders?.today || 0, icon: ShoppingBag, color: 'green' },
    { label: 'Total Customers', value: stats?.customers?.total || 0, icon: Users, color: 'purple' },
    { label: 'Inventory Value', value: formatCurrency(stats?.inventory?.value || 0), icon: Package, color: 'blue' },
  ]

  return (
    <div>
      <h1 className="header-title" style={{ marginBottom: '24px' }}>Dashboard</h1>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue Trend (30 Days)</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis dataKey="date" stroke="#8888a0" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis stroke="#8888a0" fontSize={12} tickFormatter={(val) => `Rs. ${val}`} />
                  <Tooltip
                    contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '8px' }}
                    labelStyle={{ color: '#f0f0f5' }}
                    formatter={(value) => [formatCurrency(value).replace('.00', ''), 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Low Stock Alerts</h3>
            <Link to="/inventory?lowStock=true" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="card-body">
            {stats?.lowStockAlerts?.length > 0 ? (
              <div>
                {stats.lowStockAlerts.map((product) => (
                  <div key={product._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AlertTriangle size={18} color="var(--accent-amber)" />
                      <div>
                        <div style={{ fontWeight: 500 }}>{product.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>SKU: {product.sku}</div>
                      </div>
                    </div>
                    <div className="badge badge-warning">{product.quantity} left</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <TrendingUp size={48} />
                <p>All products are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Orders</h3>
          <Link to="/pos" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>{order.orderNumber}</td>
                  <td>{order.customer?.name || 'Walk-in'}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <span className={`badge badge-${order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'danger'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
