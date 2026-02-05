const Razorpay = require('razorpay');
const crypto = require('crypto');

// Server-side plan pricing (NEVER trust frontend for prices)
const PLAN_PRICING = {
    'kms-180': 50,
    'kms-365': 90,
    'hwid-perm': 250,
    'office-ohook': 150
};

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
        const { planId, operatorId } = req.body;

        console.log('📦 Create order request:', { planId, operatorId });

        // Validate plan exists
        if (!PLAN_PRICING[planId]) {
            console.error('❌ Invalid plan ID:', planId);
            return res.status(400).json({ error: 'Invalid plan ID' });
        }

        // Check environment variables
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('❌ Razorpay credentials missing');
            return res.status(500).json({ error: 'Payment gateway not configured' });
        }

        console.log('🔑 Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);

        // Get price from server-side config (security: never trust frontend)
        const amount = PLAN_PRICING[planId] * 100; // Razorpay uses paise (smallest currency unit)

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Generate unique receipt ID to prevent replay attacks
        const receiptId = `receipt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        console.log('🔄 Creating Razorpay order...');

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount,
            currency: 'INR',
            receipt: receiptId,
            notes: {
                plan_id: planId,
                operator_id: operatorId,
                timestamp: new Date().toISOString()
            }
        });

        console.log('✅ Order created successfully:', order.id);

        // Return order details to frontend
        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: receiptId,
            planId: planId
        });

    } catch (error) {
        console.error('❌ Error creating Razorpay order:', error);
        console.error('Error details:', error.message, error.stack);
        res.status(500).json({
            error: 'Failed to create payment order',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
