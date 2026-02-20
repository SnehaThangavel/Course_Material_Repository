const app = require('../client/server/server');
const connectDB = require('../client/server/config/db');

module.exports = async (req, res) => {
    try {
        await connectDB();
        res.setHeader('X-Trace-ID', 'V5-STABLE-CJSONLY');
        return app(req, res);
    } catch (error) {
        console.error('CJS-TRACE-V3-Error:', error);
        res.status(500).json({
            error: error.message,
            traceId: 'V3-CJS-FINAL'
        });
    }
};
