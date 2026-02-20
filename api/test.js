module.exports = (req, res) => {
    res.status(200).json({
        message: 'API diagnostics work!',
        time: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
};
