import app from '../server/server.js';
import connectDB from '../server/config/db.js';

export default async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error('Serverless Health Error:', error);
        res.status(500).json({ error: error.message });
    }
};
