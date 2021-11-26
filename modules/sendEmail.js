require('dotenv').config();

var Mailgun = require('mailgun-js');
var mailgun = new Mailgun({
    apiKey: process.env.MAILGUN_API,
    domain: process.env.MAILGUN_DOMAIN,
    host: process.env.MAILGUN_HOST
});

module.exports = {
    emailSend: (msg) => {
        return new Promise(function(resolve) {
            mailgun.messages().send(msg, function(err, body) {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }
}