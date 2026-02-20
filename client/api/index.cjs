const app = require('../server/server');
const connectDB = require('../server/config/db');

module.exports = async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error('CJS-TRACE-V3-Error:', error);
        res.status(500).json({
            error: error.message,
            traceId: 'V3-CJS-FINAL'
        });
    }
};
