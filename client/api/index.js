import app from './server/server.js';
import connectDB from './server/config/db.js';

export default async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error('Production Serverless Error:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'production' ? null : error.message
        });
    }
};
