const crypto = require('crypto');

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        console.log('🔐 Verifying payment signature...');

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error('❌ Missing verification fields');
            return res.status(400).json({
                error: 'Missing required payment verification fields',
                verified: false
            });
        }

        // Check environment variable
        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.error('❌ Razorpay secret key missing');
            return res.status(500).json({
                error: 'Payment verification not configured',
                verified: false
            });
        }

        // Generate signature using HMAC SHA256
        // Formula: HMAC_SHA256(order_id + "|" + payment_id, secret_key)
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        // Compare signatures (constant-time comparison to prevent timing attacks)
        const isValid = crypto.timingSafeEqual(
            Buffer.from(generatedSignature),
            Buffer.from(razorpay_signature)
        );

        if (isValid) {
            console.log('✅ Payment verified successfully');
            // Payment verified successfully
            res.status(200).json({
                verified: true,
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                message: 'Payment verified successfully'
            });
        } else {
            console.error('❌ Invalid signature');
            // Invalid signature - potential fraud attempt
            res.status(400).json({
                verified: false,
                error: 'Invalid payment signature',
                message: 'Payment verification failed'
            });
        }

    } catch (error) {
        console.error('❌ Error verifying payment:', error);
        res.status(500).json({
            verified: false,
            error: 'Payment verification failed',
            message: error.message
        });
    }
};
