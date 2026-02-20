import app from '../server/server.js';
import connectDB from '../server/config/db.js';

export default async (req, res) => {
    // Ensure DB is connected
    try {
        await connectDB();
    } catch (err) {
        console.error('DB Connection error in handler:', err);
    }

    // Delegate to Express app
    return app(req, res);
};
