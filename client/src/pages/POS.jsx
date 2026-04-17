import { useState, useEffect } from 'react'
import { ShoppingCart, Trash2, CreditCard, Building, Plus, User } from 'lucide-react'
import { api, formatCurrency } from '../services/api'
import { useToastStore } from '../stores/toastStore'

export default function POS() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToastStore()

  const TAX_RATE = 0.08

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchCustomers()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?lowStock=false')
      const available = response.data.filter(p => p.quantity > 0)
      setProducts(available)
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

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers')
      setCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category?._id === selectedCategory)
    : products

  const addToCart = (product) => {
    const existing = cart.find(item => item.product._id === product._id)
    if (existing) {
      if (existing.quantity < product.quantity) {
        setCart(cart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      } else {
        addToast('Not enough stock', 'warning')
      }
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product._id === productId) {
        const newQty = item.quantity + delta
        if (newQty <= 0) return null
        if (newQty > item.product.quantity) {
          addToast('Not enough stock', 'warning')
          return item
        }
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(Boolean))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setCustomerName('')
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  const handleCheckout = async () => {
    if (cart.length === 0) {
      addToast('Cart is empty', 'warning')
      return
    }

    try {
      let customerId = null
      if (selectedCustomer) {
        customerId = selectedCustomer._id
      } else if (customerName) {
        const newCustomer = await api.post('/customers', { name: customerName })
        customerId = newCustomer.data._id
      }

      const order = {
        customer: customerId,
        items: cart.map(item => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal,
        tax,
        total,
        paymentMethod: 'cash',
        status: 'completed'
      }

      await api.post('/orders', order)
      addToast('Order completed successfully!', 'success')
      clearCart()
      fetchProducts()
    } catch (error) {
      addToast('Failed to process order', 'error')
    }
  }

  return (
    <div>
      <h1 className="header-title" style={{ marginBottom: '24px' }}>Point of Sale</h1>

      <div className="pos-container">
        <div className="pos-products">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${selectedCategory === '' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setSelectedCategory('')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`btn ${selectedCategory === cat._id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setSelectedCategory(cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div key={product._id} className="product-card" onClick={() => addToCart(product)}>
                  <div className="product-card-name">{product.name}</div>
                  <div className="product-card-price">{formatCurrency(product.price)}</div>
                  <div className="product-card-stock">In stock: {product.quantity}</div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <ShoppingCart size={48} />
                  <h3>No products available</h3>
                  <p>Add products to your inventory to start selling</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pos-sidebar">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} />
              Cart ({cart.length})
            </h3>
            {cart.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={clearCart}>
                Clear
              </button>
            )}
          </div>

          <div className="pos-cart">
            {cart.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={48} />
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product._id} className="pos-cart-item">
                  <div className="pos-cart-item-info">
                    <div className="pos-cart-item-name">{item.product.name}</div>
                    <div className="pos-cart-item-price">{formatCurrency(item.product.price)}</div>
                  </div>
                  <div className="pos-cart-item-qty">
                    <button onClick={() => updateQuantity(item.product._id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, 1)}>+</button>
                  </div>
                  <span className="pos-cart-item-total">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                  <button className="pos-cart-item-remove" onClick={() => removeFromCart(item.product._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '0 20px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <User size={16} />
              <select
                className="input-field"
                style={{ padding: '8px', fontSize: '13px' }}
                value={selectedCustomer ? selectedCustomer._id : ''}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setShowCustomerModal(true)
                  } else if (e.target.value === '') {
                    setSelectedCustomer(null)
                  } else {
                    const customer = customers.find(c => c._id === e.target.value)
                    setSelectedCustomer(customer)
                  }
                }}
              >
                <option value="">Walk-in Customer</option>
                <option value="new">+ Add New Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pos-summary">
            <div className="pos-summary-row">
              <span>Subtotal</span>
              <span style={{ fontFamily: 'JetBrains Mono' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div className="pos-summary-row">
              <span>Tax (8%)</span>
              <span style={{ fontFamily: 'JetBrains Mono' }}>{formatCurrency(tax)}</span>
            </div>
            <div className="pos-summary-row total">
              <span>Total</span>
              <span className="amount">{formatCurrency(total)}</span>
            </div>
            <div className="pos-actions">
              <button className="btn btn-success" onClick={handleCheckout}>
                <CreditCard size={18} />
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Customer</h3>
              <button className="modal-close" onClick={() => setShowCustomerModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Customer Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCustomerModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (customerName.trim()) {
                  setShowCustomerModal(false)
                }
              }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
