export default function handler(req, res) {
    res.status(200).json({
        message: 'Client-folder API reached (ESM)!',
        time: new Date().toISOString()
    });
}
