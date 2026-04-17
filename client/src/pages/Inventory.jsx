import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { api, formatCurrency, formatDate } from '../services/api'
import { useToastStore } from '../stores/toastStore'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null })
  const [searchParams] = useSearchParams()
  const { addToast } = useToastStore()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    if (searchParams.get('lowStock') === 'true') {
      setShowLowStock(true)
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (categoryFilter) params.append('category', categoryFilter)
      if (showLowStock) params.append('lowStock', 'true')
      
      const response = await api.get(`/products?${params.toString()}`)
      setProducts(response.data)
    } catch (error) {
      addToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [search, categoryFilter, showLowStock])

  const handleDelete = async () => {
    if (!deleteModal.product) return
    try {
      await api.delete(`/products/${deleteModal.product._id}`)
      addToast('Product deleted successfully', 'success')
      fetchProducts()
    } catch (error) {
      addToast('Failed to delete product', 'error')
    } finally {
      setDeleteModal({ show: false, product: null })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="header-title">Inventory</h1>
        <Link to="/inventory/new" className="btn btn-primary">
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input-field"
              style={{ width: 'auto', minWidth: '150px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>Low Stock Only</span>
            </label>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{product.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {product.description?.substring(0, 50)}...
                      </div>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono' }}>{product.sku}</td>
                    <td>
                      {product.category ? (
                        <span className="badge badge-info">{product.category.name}</span>
                      ) : '-'}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono' }}>{formatCurrency(product.price)}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
                      {formatCurrency(product.cost)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {product.quantity <= product.lowStockThreshold && (
                          <AlertTriangle size={16} color="var(--accent-amber)" />
                        )}
                        <span className={`badge ${
                          product.quantity <= product.lowStockThreshold
                            ? 'badge-warning'
                            : product.quantity > 50
                            ? 'badge-success'
                            : 'badge-info'
                        }`}>
                          {product.quantity}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <Link to={`/inventory/${product._id}/edit`} className="btn btn-secondary btn-sm">
                          <Edit2 size={14} />
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteModal({ show: true, product })}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, product: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Product</h3>
              <button className="modal-close" onClick={() => setDeleteModal({ show: false, product: null })}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteModal.product?.name}</strong>?</p>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, product: null })}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
