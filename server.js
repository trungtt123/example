const express = require("express");
const bodyParser = require("body-parser");
var app = express();
require('dotenv').config()
require('./db/connection');
var cors = require('cors');

const user = require('./controllers/user');
const http = require('http'); // CORE MODULE, USED TO CREATE THE HTTP SERVER
const UserModel = require("./db/models/user");
const server = http.createServer(app); // CREATE HTTP SERVER USING APP
const port = process.env.PORT;



app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1000mb' }));
app.use(cors());



app.get('/api/users', async (req, res, next) => {
	try {
		let data = await UserModel.find({});
		return res.status(200).json(data);
	}
	catch (e) {
		return res.status(400).send('Lỗi bất định');
	}
	// return res.json(123);
})
app.post('/api/user', async (req, res, next) => {
	try {
		const { fullName } = req.body;
		await UserModel.create({ fullName });
		return res.status(200).json('Thêm mới thành công');
	}
	catch (e) {
		return res.status(400).send('Lỗi bất định');
	}
})
app.put('/api/user/:userId', async (req, res, next) => {
	try {
	const { userId } = req.params;
	console.log(userId);
	const { fullName } = req.body;
	await UserModel.findOneAndUpdate({_id: userId}, { fullName:fullName });
	return res.status(200).json('Cập nhật thành công');
	}
	catch(e){
		return res.status(400).send('Lỗi bất định');
	}
})
app.delete('/api/user/:userId', async (req, res, next) => {
	try {
	const { userId } = req.params;
	await UserModel.remove({_id: userId});
	return res.status(200).json('Xóa thành công');
	}
	catch(e){
		return res.status(400).send('Lỗi bất định');
	}
})
app.set('port', port);

// LISTEN ON SPECIFIED PORT
server.listen(port);

// LOG WHICH PORT THE SERVER IS RUNNING ON
console.log('Server listening on port ' + port);

// ERROR HANDLER
app.use((err, req, res, next) => {
	console.log(err);
	res.status(err.status || 500).send(err.stack);
});

module.exports = app;