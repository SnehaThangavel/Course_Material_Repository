module.exports = (req, res) => {
    res.status(200).json({ message: "Root API Detection Successful", time: new Date() });
};
