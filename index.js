var fs = require('fs'),
	yaml = require('yaml')
	_ = require('underscore'),
	nodemailer = require('nodemailer'),
	express = require('express'),
	app = express();

app.use(express.bodyParser());

// Simple logger
app.use(function (request, response, next) {
	console.log('%s %s', request.method, request.url);
	next();
});

// Handle uncaughtException
process.on('uncaughtException', function (error) {
	exit('Error: ' + error.message);
});

var exit = function (message) {
	if (message) {
		console.log(message);
	}
	console.log('Exiting...');
	process.exit(1);
};

// Open the config file and establish user settings.
var config = yaml.eval(fs.readFileSync('config.yaml', 'utf8').toString());

// Validate the config file and ensure mandatory fields exist
if (!_.has(config, 'from') || !_.isString(config.from)) {
	exit('Invalid config. From must be an email address.');
}

if (!_.has(config, 'ses') || !_.isObject(config.ses)) {
	exit('Invalid config. AWS SES settings are missing.');
}

if (!_.has(config.ses, 'access') || !_.isString(config.ses.access)) {
	exit('Invalid config. AWS SES Access Key is missing.');
}

if (!_.has(config.ses, 'secret') || !_.isString(config.ses.access)) {
	exit('Invalid config. AWS SES Secret Key is missing.');
}

// Configure the Mail
var mailTransport = nodemailer.createTransport('SES', {
	AWSAccessKeyID: config.ses.access,
	AWSSecretKey: config.ses.secret
});

app.options('/', function (request, response) {

	// CORS support
	response.set('Access-Control-Allow-Origin', '*');
	response.set('Access-Control-Allow-Methods', 'POST');
	response.set('Access-Control-Allow-Headers', 'Content-Type');

	// The block definition
	response.send({
		name: "Send Email",
		description: "Block for sending emails.",
		inputs: [{
			name: "to",
			type: "string",
			description: "The email address of the message's recipient."
		}, {
			name: "subject",
			type: "string",
			description: "A brief summary of the topic of the message."
		}, {
			name: "body",
			type: "string",
			description: "The main content of the message."
		}]
	});
});

app.post('/', function (request, response) {

	// Verify POST keys exist
	if (!_.has(request.body, 'to')) {
		exit('Email "to" address is missing.');
	}
	if (!_.has(request.body, 'subject')) {
		exit('Email "subject" is missing.');
	}
	if (!_.has(request.body, 'body')) {
		exit('Email "body" is missing.');
	}

	// Send mail
	var mailOptions = {
		from: config.from,
		to: request.body.to,
		subject: request.body.subject,
		text: request.body.body,
	};

	mailTransport.sendMail(mailOptions, function (error, res) {
		if (error) {
			console.log('Failed to send email.');
			response.send(500);
		} else {
			response.send(200);
		}
	});
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log('Listening on ' + port);
});