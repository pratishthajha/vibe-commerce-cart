import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import CheckoutForm from './components/CheckoutForm';
import ReceiptModal from './components/ReceiptModal';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], subTotal: 0 });
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cart');
      setCart(response.data.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await axios.post('http://localhost:5000/api/cart', {
        productId,
        qty: quantity
      });
      setCart(response.data.data);
      alert('Item added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart.');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/cart/${itemId}`);
      setCart(response.data.data);
    } catch (err) {
      console.error('Error removing from cart:', err);
      alert('Failed to remove item.');
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/cart/${itemId}`, {
        quantity
      });
      setCart(response.data.data);
    } catch (err) {
      console.error('Error updating cart:', err);
      alert('Failed to update quantity.');
    }
  };

  const handleCheckout = async (customerData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/checkout', {
        cartItems: cart.items,
        customerName: customerData.name,
        customerEmail: customerData.email
      });
      
      setReceipt(response.data.data);
      setShowCheckout(false);
      setShowCart(false);
      setShowReceipt(true);
      fetchCart();
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('Checkout failed.');
    }
  };

  const cartItemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🛍️ Vibe Commerce</h1>
          <div className="header-actions">
            <button 
              className="cart-button"
              onClick={() => setShowCart(!showCart)}
            >
              🛒 Cart ({cartItemCount})
              {cart.subTotal > 0 && (
                <span className="cart-total"> - ₹{cart.subTotal}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchProducts} style={{marginLeft: '10px'}}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <>
            {!showCart && !showCheckout && (
              <ProductGrid 
                products={products} 
                onAddToCart={addToCart}
              />
            )}

            {showCart && !showCheckout && (
              <Cart 
                cart={cart}
                onRemove={removeFromCart}
                onUpdateQuantity={updateCartItem}
                onCheckout={() => setShowCheckout(true)}
                onContinueShopping={() => setShowCart(false)}
              />
            )}

            {showCheckout && (
              <CheckoutForm 
                cart={cart}
                onSubmit={handleCheckout}
                onCancel={() => setShowCheckout(false)}
              />
            )}
          </>
        )}
      </main>

      {showReceipt && receipt && (
        <ReceiptModal 
          receipt={receipt}
          onClose={() => {
            setShowReceipt(false);
            setReceipt(null);
          }}
        />
      )}

      <footer className="app-footer">
        <p>© 2025 Vibe Commerce - Mock E-Commerce Assignment</p>
      </footer>
    </div>
  );
}

export default App;
