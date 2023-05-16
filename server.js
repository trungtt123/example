const express = require("express");
const bodyParser = require("body-parser");
const axios = require('axios');
var app = express();
require('dotenv').config()
var cors = require('cors');
const http = require('http'); // CORE MODULE, USED TO CREATE THE HTTP SERVER
const server = http.createServer(app); // CREATE HTTP SERVER USING APP
const port = process.env.PORT;
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1000mb' }));
app.use(cors());

app.get('/mf-timesheet/worklog', async (req, res, next) => {
	try {
		const { start, end, Apikey } = req.query;
		// https://timesheet-plugin.herokuapp.com/api/1/exportData.csv?start=2022-04-01&end=2023-05-14&allUsers=true&Apikey=x0DF4PPllY1RZJtDDh%2BdOeiceho7dnNVcWMO%2FSY1K6e7Tcovk99ZUvU0RPktnM%2FV4%2BtfiRDOgeM1Oj899xFA%2Bw%3D%3D
		axios.get(`https://timesheet-plugin.herokuapp.com/api/1/exportData.csv?start=${start}&end=${end}&Apikey=${Apikey}&allUsers=true`)
			.then((response) => {
				const data = response.data.trim().split('\n');
				data.pop();
				data.splice(0, 1);
				let result = [];
				let timeTmp = 0;
				for (let item of data) {
					let o = {};
					let itemTmp = item.split(',');
					o.projectName = itemTmp[0]?.slice(1, -1);
					o.issueType = itemTmp[1];
					o.key = itemTmp[2];
					o.summary = itemTmp[3]?.slice(1, -1);
					o.priority = itemTmp[4]?.slice(1, -1);
					o.dateStarted = itemTmp[5];
					o.displayName = itemTmp[6]?.slice(1, -1);
					o.timeSpent = +itemTmp[7];
					timeTmp += o.timeSpent;
					o.workDescription = itemTmp[8]?.slice(1, -1);
					let userIndex = result.findIndex(user => user.displayName === o.displayName);
					if (userIndex === -1){
						result.push({
							displayName: o.displayName,
							projects: [{
								projectName: o.projectName,
								totalTimeSpent: o.timeSpent
							}],
							totalTime: o.timeSpent
						})
					}
					else {
						let projectIndex = result[userIndex].projects.findIndex(project => project.projectName === o.projectName);
						if (projectIndex === -1){
							result[userIndex].projects.push({
								projectName: o.projectName,
								totalTimeSpent: o.timeSpent
							});
							result[userIndex].totalTime += o.timeSpent;
						}
						else {
							result[userIndex].projects[projectIndex].totalTimeSpent += o.timeSpent;
							result[userIndex].totalTime += o.timeSpent;
						}
					}
				}
				for (let userIndex in result){
					let currentPercentTmp = 0;
					result[userIndex].projects.sort(function(a, b) {
						return b.totalTimeSpent - a.totalTimeSpent;
					  });
					for (let projectIndex in result[userIndex].projects){
						result[userIndex].projects[projectIndex]['timePercent'] = Math.floor(result[userIndex].projects[projectIndex].totalTimeSpent / result[userIndex].totalTime * 100);
						currentPercentTmp += result[userIndex].projects[projectIndex]['timePercent'];
					}
					let currentPercentTmp2 = 0;
					const percentRemain = 100 - currentPercentTmp;
					for (let projectIndex = 0; projectIndex < percentRemain; projectIndex++){
						result[userIndex].projects[projectIndex]['timePercent']++;
					}
					for (let projectIndex in result[userIndex].projects){
						currentPercentTmp2 += result[userIndex].projects[projectIndex]['timePercent'];
					}
				}
				
				return res.status(200).json(result);
			})
			.catch((error) => {
				// Xử lý lỗi
				console.error(error);
				return res.status(400).send('Lỗi bất định');
			});
		
	}
	catch (e) {
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