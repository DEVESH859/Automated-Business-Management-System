import { useState, useEffect } from 'react'
import { DollarSign, ShoppingBag, TrendingUp, Package } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api, formatCurrency, formatDate } from '../services/api'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7']

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    try {
      const [statsRes, chartRes, productsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get(`/dashboard/chart?period=${period}`),
        api.get('/dashboard/top-products')
      ])
      setStats(statsRes.data)
      setChartData(chartRes.data)
      setTopProducts(productsRes.data)
    } catch (error) {
      console.error('Error fetching report data:', error)
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

  const revenueByPeriod = {
    today: stats?.revenue?.today || 0,
    week: stats?.revenue?.week || 0,
    month: stats?.revenue?.month || 0,
    year: stats?.revenue?.total || 0
  }

  const categoryData = topProducts.map((p, i) => ({
    name: p.name,
    value: p.revenue,
    color: COLORS[i % COLORS.length]
  }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="header-title">Reports & Analytics</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              className={`btn ${period === p ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue"><DollarSign size={24} /></div>
          </div>
          <div className="stat-value">{formatCurrency(revenueByPeriod[period])}</div>
          <div className="stat-label">
            Revenue ({period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'Total'})
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green"><ShoppingBag size={24} /></div>
          </div>
          <div className="stat-value">{stats?.orders?.[period] || 0}</div>
          <div className="stat-label">
            Orders ({period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'Total'})
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple"><TrendingUp size={24} /></div>
          </div>
          <div className="stat-value">
            {revenueByPeriod[period] && stats?.orders?.[period]
              ? formatCurrency(revenueByPeriod[period] / stats.orders[period])
              : '$0.00'}
          </div>
          <div className="stat-label">Average Order Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue"><Package size={24} /></div>
          </div>
          <div className="stat-value">{stats?.inventory?.totalProducts || 0}</div>
          <div className="stat-label">Products in Inventory</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue Over Time</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis
                    dataKey="date"
                    stroke="#8888a0"
                    fontSize={12}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#8888a0" fontSize={12} tickFormatter={(val) => `Rs. ${val}`} />
                  <Tooltip
                    contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '8px' }}
                    labelStyle={{ color: '#f0f0f5' }}
                    formatter={(value) => [formatCurrency(value).replace('.00', ''), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Selling Products</h3>
          </div>
          <div className="card-body">
            {topProducts.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '8px' }}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                  {categoryData.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: item.color }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <TrendingUp size={48} />
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Top Products Details</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.id}>
                  <td>
                    <span className="badge badge-info">#{index + 1}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>{product.quantity}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--accent-green)' }}>
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No product data available
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
