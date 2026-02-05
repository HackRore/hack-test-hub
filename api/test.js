module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({
        status: 'ok',
        message: 'API is working',
        env_check: {
            has_key_id: !!process.env.RAZORPAY_KEY_ID,
            has_key_secret: !!process.env.RAZORPAY_KEY_SECRET,
            key_id_preview: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 15) + '...' : 'MISSING'
        },
        node_version: process.version
    });
};
