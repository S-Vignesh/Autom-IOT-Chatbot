var request = require('request');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');

var conf = require('./conf');

var app = express();
app.use(compression());
app.set('case sensitive routing', true);
app.use(bodyParser.json());

var httpServer = http.createServer(app);

app.get('/', function (req, res, next) {
  res.send('Welcome to Facebook Messenger Bot. This is root endpoint');
});

app.get('/webhook/', handleVerify);
app.post('/webhook/', receiveMessage);
app.get('/check/', function(req, res) {
	var data = 1;
	res.send(data);
})

function handleVerify(req, res, next){
	if (req.query['hub.verify_token'] === conf.VERIFY_TOKEN) {
    return res.send(req.query['hub.challenge']);
  }
  res.send('Validation failed, Verify token mismatch');
}

function receiveMessage(req, res, next){
	var message_instances = req.body.entry[0].messaging;
	message_instances.forEach(function(instance){
		var sender = instance.sender.id;
		if(instance.message && instance.message.text) {
			var msg_text = instance.message.text;
			if(msg_text == "light on") {
				sendMessage(sender, "The lights are on.", true);	
			}
			else if(msg_text == "light off") {
				sendMessage(sender, "The lights are off.", true);	
			}
			else {
				sendMessage(sender, "invalid command", true);
			}
		}
	});
  res.sendStatus(200);
}

function sendMessage(receiver, data, isText){
	var payload = {};
	payload = data;
	
	if(isText) {
		payload = {
			text: data
		}
	}

	request({
    url: conf.FB_MESSAGE_URL,
    method: 'POST',
    qs: {
    	access_token: conf.PROFILE_TOKEN
    },
    json: {
      recipient: {id: receiver},
      message: payload
    }
  }, function (error, response) {
  	if(error) console.log('Error sending message: ', error);
  	if(response.body.error) console.log('Error: ', response.body.error);
  });
}

var port = conf.PORT;
httpServer.listen(port, function () {
	console.log("Express http server listening on port " + port);
});