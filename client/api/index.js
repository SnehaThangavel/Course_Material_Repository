import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const app = require('../server/server');
const connectDB = require('../server/config/db');

export default async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error('ESM Serverless Error:', error);
        res.status(500).json({ error: error.message });
    }
};
