/* ============================================
   LIBRA HOUSE — Server
   Express backend for Razorpay payments
   ============================================ */

require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files (index.html, CSS, JS, images)

// --- Razorpay Instance ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- Orders Storage (JSON file) ---
const ORDERS_FILE = path.join(__dirname, 'orders.json');

function readOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading orders:', e.message);
  }
  return [];
}

function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function saveOrder(order) {
  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);
}

function updateOrder(orderId, updates) {
  const orders = readOrders();
  const idx = orders.findIndex(o => o.order_id === orderId);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...updates };
    writeOrders(orders);
    return orders[idx];
  }
  return null;
}

// ============================================
// API: Get Razorpay Key (public, safe to expose)
// ============================================
app.get('/api/get-key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// ============================================
// API: Create Order
// POST /api/create-order
// Body: { amount, currency, receipt, items, customer }
// ============================================
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, items, customer } = req.body;

    // Validate amount (minimum 100 paise = ₹1)
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 100 paise (₹1)',
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount), // amount in paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save order locally
    saveOrder({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: 'created',
      items: items || [],
      customer: customer || {},
      created_at: new Date().toISOString(),
      payment_id: null,
      signature: null,
    });

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Create order error:', error);

    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        error: 'Razorpay authentication failed. Check your API keys.',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create order. Please try again.',
    });
  }
});

// ============================================
// API: Verify Payment Signature
// POST /api/verify-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// ============================================
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature',
      });
    }

    // Generate expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // Compare signatures
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed. Signature mismatch.',
      });
    }

    // Update order status
    const updatedOrder = updateOrder(razorpay_order_id, {
      status: 'paid',
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
      paid_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed. Please contact support.',
    });
  }
});

// ============================================
// API: Get Order (for tracking)
// GET /api/orders/:orderId
// ============================================
app.get('/api/orders/:orderId', (req, res) => {
  const orders = readOrders();
  const order = orders.find(o => o.order_id === req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  res.json({ success: true, order });
});

// ============================================
// Fallback: serve index.html for any non-API route
// ============================================
app.get('/:path', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, req.path === '/tracking' ? 'tracking.html' : 'index.html'));
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`\n  ✦ Libra House server running at http://localhost:${PORT}`);
  console.log(`  ✦ Razorpay Key: ${process.env.RAZORPAY_KEY_ID}`);
  console.log(`  ✦ Mode: ${process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test') ? 'TEST' : 'LIVE'}\n`);
});
