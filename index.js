/**
 * This file represents Youtube Game Bar Overlay's Feedback Server. 
 * It receives HTTP Requests and transforms it into SMTP messages aimed to be sent to the developer as a feedback message.
 *
 * @author: Marconi Gomes (marconi.gomes7@gmail.com)
 */
const winston = require('winston');
const SMTPConnection = require('nodemailer/lib/smtp-connection');
const fs = require('fs');
const SMTP_CONFIG = JSON.parse(fs.readFileSync('./smtp-config.json', 'utf8'));
var YTGBFS = require('express')();
var bodyParser = require('body-parser');
var http = require('http').createServer(YTGBFS);
var connection;


/**
 * Creates a Winston Logger instance.
 */
const logger = winston.createLogger({
  level: 'http',
  format: winston.format.prettyPrint(),
  transports: [
    new winston.transports.File({ filename: 'status_feedback.log' }),
    new winston.transports.Console()
  ]
});


/**
 * Sets up the common configurations for a new SMTP Connection.
 */
function setupMailingCommons() {
  let options = {
    'host': SMTP_CONFIG.SERVER_ADDRESS,
    'port': SMTP_CONFIG.SERVER_PORT,
    'secure': SMTP_CONFIG.SERVER_REQUIRES_SSL,
  };
  
  connection = new SMTPConnection(options);
  logger.log({ timestamp: new Date().toUTCString(), level: 'info', message: 'Mailing instance Ready.' });
}


/**
 * Listens for connections on port 54521.
 */
http.listen(54521, () => {
  setupMailingCommons();
  logger.log({ timestamp: new Date().toUTCString(), level: 'info', message: 'Server Ready.' });
});


/**
 * Parses the bodyrequest body into JSON format.
 */
YTGBFS.use(bodyParser.json());


/**
 * Handles POST requests on /feedback route.
 * Tries to parse the body of the request for a feedback message.
 *
 * We can expect the following results:
 * 200 OK - The feedback message was sucessfully sent. The status code is returned to requester.
 * 400 BAD REQUEST - The request body wasn't in the expected format. The status code is returned.
 * 500 INTERNAL SERVER ERROR - Something went wrong with the server. The status code is returned.
 */
YTGBFS.post('/feedback', (request, response, next) => {
  logger.log({timestamp: new Date().toUTCString(), level: 'http', message: 'Got POST search request...'});

  if (request.body.message !== undefined) {
    sendFeedback(request.body.message).then( function() {
      logger.log({ timestamp: new Date().toUTCString(), level: 'info', message: 'Feedback sent successfully.'});
      response.sendStatus(200);
    }).catch( function(errorData) {
      next({message: '500 INTERNAL SERVER ERROR', details: errorData});
    });
  } 
  else {
    next({message: '400 BAD REQUEST', details: 'Missing or malfunct body.'});
  }
});


/**
 * Uses the specified error handler.
 */
YTGBFS.use(errorHandler);


/**
 * Handles the operations to send a feedback through SMT protocol with the help of Node Mailer.
 * 
 * @param {*} message The message to be converted and sent to destination.
 */
function sendFeedback(message) {
  return new Promise((resolve, reject) => {
    var sendCallback = function(err, info) {
      if (err) { reject("Send error! ---> " + err); }
      else {
        connection.quit();
        logger.log({ timestamp: new Date().toUTCString(), level: 'info', message: 'Connection closed OK.' });

        resolve();
      }
    };

    var loginCallback = function(err) {
      if (err) { reject("Login error! ---> " + err); }
      else {
        logger.log({ timestamp: new Date().toUTCString(), level: 'info', message: 'Login OK.' });

        let envelope = {
          'from': SMTP_CONFIG.SOURCE_MAIL_ADDRESS,
          'to': SMTP_CONFIG.DESTINATION_MAIL_ADDRESS
        }
        connection.send(envelope, message, sendCallback);
      }
    };
    
    let authenticationCallback = function() {
      logger.log({ timestamp: new Date().toUTCString(), level: 'info', message: 'Connection OK.' });

      let auth = {
        'credentials': {
          'user': SMTP_CONFIG.USER,
          'pass': SMTP_CONFIG.PWD
        }
      }
      connection.login(auth, loginCallback)
    };

    connection.connect(authenticationCallback);
  })
}


/**
 * Handles the errors provided by the server, answering them accordingly to the requester.
 * 
 * @param {*} error The error received from above layers.
 * @param {*} request The source request.
 * @param {*} response The response to be made.
 * @param {*} next The next function to be used.
 */
function errorHandler(error, request, response, next) {
  logger.log({ timestamp: new Date().toUTCString(), level: 'error', message: error.details })

  if (error.message.startsWith('500')) {
    response.status(500).send({ error: 'Internal Server Error!' })
  }
  else {
    response.status(400).send({ error: 'Bad request!' })
  }
}