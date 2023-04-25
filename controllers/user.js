const UserModel = require('../db/models/user');
module.exports = (app) => {
    app.post('/api/user/', (req, res) => {
        const { fullName } = req.body;
        console.log(fullName);
    });
};