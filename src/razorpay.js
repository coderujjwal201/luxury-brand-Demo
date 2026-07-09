const Razorpay = require('razorpay');
const dotenv = require('dotenv');

dotenv.config();

const hasRazorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
let razorpay = null;

if (hasRazorpay) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay Service: Initialized with keys.');
} else {
    console.log('Razorpay Service: No credentials found. Running in local test simulation mode.');
}

module.exports = {
    hasRazorpay: !!hasRazorpay,
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_keys',
    
    // Create order server-side before opening payment popup
    async createOrder(amount, receiptId) {
        if (hasRazorpay) {
            const options = {
                amount: Math.round(amount * 100), // amount in the smallest currency unit (paise for INR)
                currency: "INR",
                receipt: receiptId,
                payment_capture: 1
            };
            return new Promise((resolve, reject) => {
                razorpay.orders.create(options, (err, order) => {
                    if (err) {
                        console.error('Razorpay Order Creation Error:', err);
                        reject(err);
                    } else {
                        resolve(order);
                    }
                });
            });
        } else {
            // Mock Razorpay order object
            return {
                id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
                amount: Math.round(amount * 100),
                currency: 'INR',
                receipt: receiptId,
                status: 'created'
            };
        }
    },

    // Verify cryptographic payment signature
    verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        if (hasRazorpay) {
            const crypto = require('crypto');
            const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
            const digest = shasum.digest('hex');
            return digest === razorpaySignature;
        } else {
            // Mock validation passes automatically in simulation mode
            return true;
        }
    }
};
