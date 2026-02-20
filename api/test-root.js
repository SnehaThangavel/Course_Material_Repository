export default function handler(req, res) {
    res.status(200).json({
        message: 'Root API ESM primitive reached!',
        time: new Date().toISOString()
    });
}
