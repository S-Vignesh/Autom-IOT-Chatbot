var request = require('request');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');

var conf = require('./conf');
var people = 1;
var lightState = false;

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
			var msg_text = instance.message.text.toLowerCase();
			if(msg_text == "turn the lights on") {
				sendMessage(sender, "Sure, I turned the lights on", true);
				lightState = true;	
			}
			else if(msg_text == "turn the lights off") {
				sendMessage(sender, "Sure, I turned the lights off", true);
				lightState = false;	
			}
			else if(msg_text == "hi"||msg_text == "hey"||msg_text == "hello") {
				sendMessage(sender, "Hi! This is Autom, I am your personal home automation chatbot, designed by 3 students of VIT! How may I help you?", true);	
			}
			else if(msg_text == "what can you do?") {
				sendMessage(sender, "I can perform the following actions - \n1.Turn the lights on\n2.Turn the lights off\n3.Set the thermostat to [value]\n4.Are the lights on?\n5.Is there anyone in the house?", true);	
			}
			else if(msg_text == "set the thermostat to " + [16,17,18,19,20,21,22,23,24,25,26,27,28]) {
				sendMessage(sender, "I have changed the temperature of the thermostat.", true);	
			}
			else if(msg_text == "is there anyone in the house?") {
				if(people!=0){
					if(people==1)
						sendMessage(sender,"Yes, there is a person in the house",true);
					else
						sendMessage(sender,"Yes, there are " + people + " people in the house",true);
				}
				else
					sendMessage(sender,"No, there is no one in the house",true);				
					
			}
			else if(msg_text == "are the lights on?") {
				if(lightState)				
				sendMessage(sender, "Yes, the lights are on", true);
				else
				sendMessage(sender, "No, the lights are off", true);	
			}
			

			else {
				sendMessage(sender, "Sorry, I didn't get that", true);
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
