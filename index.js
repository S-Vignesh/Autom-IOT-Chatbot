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
	var data = 0;
	res.send("The value is "+data);
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
			if(msg_text == "Turn the lights on.") {
				sendMessage(sender, "The lights are turned on.", true);	
			}
			else if(msg_text == "Turn the lights off.") {
				sendMessage(sender, "The lights are turned off.", true);	
			}
			else if(msg_text == "Hi") {
				sendMessage(sender, "Hi! This is Autom, a personal home automation chatbot, designed by 3 students of VIT! How may i help you?", true);	
			}
			else if(msg_text == "Hey") {
				sendMessage(sender, "Hey! This is Autom, a personal home automation chatbot, designed by 3 students of VIT! How may i help you?", true);	
			}
			else if(msg_text == "Hello") {
				sendMessage(sender, "Hello! This is Autom, a personal home automation chatbot, designed by 3 students of VIT! How may i help you?", true);	
			}
			else if(msg_text == "What can you do?") {
				sendMessage(sender, "I can perform a variety of functions, commands for which are given below.\n1.Turn the lights on.\n2.Turn the lights off.", true);	
			}

			else {
				sendMessage(sender, "Sorry, i didn't get that.", true);
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
