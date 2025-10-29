import React from 'react';
import './ReceiptModal.css';

const ReceiptModal = ({ receipt, onClose }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="receipt-modal">
        <div className="receipt-header">
          <h2>✅ Order Confirmed!</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="receipt-content">
          <div className="receipt-success-message">
            <p>{receipt.message}</p>
          </div>

          <div className="receipt-section">
            <h3>Order Details</h3>
            <div className="receipt-info">
              <div className="info-row">
                <span className="info-label">Order ID:</span>
                <span className="info-value">{receipt.orderId}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Customer Name:</span>
                <span className="info-value">{receipt.customerName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{receipt.customerEmail}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date:</span>
                <span className="info-value">{formatDate(receipt.timestamp)}</span>
              </div>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Items Ordered</h3>
            <div className="receipt-items">
              {receipt.items.map((item, index) => (
                <div key={index} className="receipt-item">
                  <div className="receipt-item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <span className="item-price">₹{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="receipt-total">
            <span className="total-label">Total Amount:</span>
            <span className="total-value">₹{receipt.total}</span>
          </div>

          <div className="receipt-footer">
            <p>A confirmation email has been sent to {receipt.customerEmail}</p>
            <button className="continue-btn" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
