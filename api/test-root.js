module.exports = (req, res) => {
    res.status(200).json({
        message: 'Root API primitive reached!',
        env: process.env.NODE_ENV,
        time: new Date()
    });
};
