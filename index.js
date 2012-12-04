var webpipes = require('node-webpipe');
var nodemailer = require('nodemailer');

// Configure the Mail
var mail = nodemailer.createTransport('SES', {
    AWSAccessKeyID: process.env['SES_ACCESS_KEY_ID'],
    AWSSecretKey: process.env['SES_SECRET_ACCESS_KEY']
});

var block = new webpipes.Block()
    .name("Send Email")
    .description("WebPipe block for sending emails.")
    .input("to", "string", "The email address of the message's recipient.")
    .input("subject", "string", "A brief summary of the topic of the message.")
    .input("body", "string", "The main content of the message.")

block.handle(function(inputs, callback) {
    var options = {
        from: process.env['EMAIL_FROM'] || 'WebPipe Action <action@webpipes.org>',
        to: inputs.to,
        subject: inputs.subject,
        text: inputs.body,
    };
    mail.sendMail(options, function (error, res) {
        if (error) {
            callback(error);
        } else {
            callback(null, {});
        }
    });
});

block.listen();
