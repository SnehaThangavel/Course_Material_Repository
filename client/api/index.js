const app = require('../server/server');
const connectDB = require('../server/config/db');

module.exports = async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error('Production Serverless Error:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
};
