import React from 'react';
import './Cart.css';

const Cart = ({ cart, onRemove, onUpdateQuantity, onCheckout, onContinueShopping }) => {
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Add some items to get started!</p>
          <button className="continue-shopping-btn" onClick={onContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <button className="continue-shopping-btn" onClick={onContinueShopping}>
          ← Continue Shopping
        </button>
      </div>

      <div className="cart-items">
        {cart.items.map((item) => (
          <div key={item._id} className="cart-item">
            <div className="cart-item-image">
              {item.productId && (
                <img 
                  src={item.productId.image} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                  }}
                />
              )}
            </div>
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <p className="cart-item-price">₹{item.price} each</p>
            </div>
            <div className="cart-item-quantity">
              <button 
                className="qty-btn"
                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="quantity">{item.quantity}</span>
              <button 
                className="qty-btn"
                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="cart-item-total">
              <p className="item-total">₹{item.total}</p>
              <button 
                className="remove-btn"
                onClick={() => onRemove(item._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span className="summary-value">₹{cart.subTotal}</span>
        </div>
        <div className="summary-row total-row">
          <span>Total:</span>
          <span className="summary-value">₹{cart.subTotal}</span>
        </div>
        <button className="checkout-btn" onClick={onCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
