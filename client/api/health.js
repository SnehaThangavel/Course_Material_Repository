module.exports = (req, res) => {
    res.status(200).json({
        message: 'Client-folder API reached!',
        time: new Date().toISOString()
    });
};
