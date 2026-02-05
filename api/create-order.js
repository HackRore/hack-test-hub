import Razorpay from 'razorpay';
import crypto from 'crypto';

// Server-side plan pricing (NEVER trust frontend for prices)
const PLAN_PRICING = {
    'kms-180': 50,
    'kms-365': 90,
    'hwid-perm': 250,
    'office-ohook': 150
};

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { planId, operatorId } = req.body;

        // Validate plan exists
        if (!PLAN_PRICING[planId]) {
            return res.status(400).json({ error: 'Invalid plan ID' });
        }

        // Get price from server-side config (security: never trust frontend)
        const amount = PLAN_PRICING[planId] * 100; // Razorpay uses paise (smallest currency unit)

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Generate unique receipt ID to prevent replay attacks
        const receiptId = `receipt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

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

        // Return order details to frontend
        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: receiptId,
            planId: planId
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            error: 'Failed to create payment order',
            message: error.message
        });
    }
}
