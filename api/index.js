module.exports = (req, res) => {
    res.status(200).json({
        message: 'Root API reached!',
        url: req.url,
        method: req.method,
        headers: req.headers.host
    });
};
