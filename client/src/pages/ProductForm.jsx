import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { api } from '../services/api'
import { useToastStore } from '../stores/toastStore'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const isEditing = Boolean(id)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost: '',
    quantity: '',
    category: '',
    lowStockThreshold: '10',
    imageUrl: ''
  })

  useEffect(() => {
    fetchCategories()
    if (isEditing) {
      fetchProduct()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      const product = response.data
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        quantity: product.quantity?.toString() || '',
        category: product.category?._id || '',
        lowStockThreshold: product.lowStockThreshold?.toString() || '10',
        imageUrl: product.imageUrl || ''
      })
    } catch (error) {
      addToast('Failed to load product', 'error')
      navigate('/inventory')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      quantity: parseInt(formData.quantity),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
      category: formData.category || null
    }

    try {
      if (isEditing) {
        await api.put(`/products/${id}`, data)
        addToast('Product updated successfully', 'success')
      } else {
        await api.post('/products', data)
        addToast('Product created successfully', 'success')
      }
      navigate('/inventory')
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to save product', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/inventory')}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="header-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                />
              </div>
              <div className="input-group">
                <label className="input-label">SKU *</label>
                <input
                  type="text"
                  name="sku"
                  className="input-field"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  placeholder="e.g., PRD-001"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea
                name="description"
                className="input-field"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  className="input-field"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Cost ($) *</label>
                <input
                  type="number"
                  name="cost"
                  className="input-field"
                  value={formData.cost}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  className="input-field"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select
                  name="category"
                  className="input-field"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Low Stock Threshold</label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  className="input-field"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  min="0"
                  placeholder="10"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  className="input-field"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={18} />
                {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/inventory')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
