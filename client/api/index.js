const app = require('../server/server.cjs');
const connectDB = require('../server/config/db.cjs');

module.exports = async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error('Production Serverless Error:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
            context: 'Internalized Handler V1'
        });
    }
};
