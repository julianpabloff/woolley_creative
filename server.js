const express = require('express');
const app = express();

app.use(express.static(__dirname + '/app'));

const routes = [
];
app.all('*', (request, response) => {
	console.log(request.url);
	if (!request.url.includes('components')) {
		console.log('SENDING INDEX - STARTING OVER');
		response.sendFile(__dirname + '/app/index.html');
	}
	else response.send('');
});

app.listen(8000, () => console.log('listening on port 8000'));
