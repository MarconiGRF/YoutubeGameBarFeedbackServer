# Youtube GameBar Feedback Server
A simple server to implement [YTGBO](https://github.com/MarconiGRF/YoutubeGameBarOverlay)'s Feedback system. It converts HTTP formatted request into SMTP message and sends it.

## Usage
* 1: Clone this repository.  
* 2: On repository's root, run `npm install`.  
* 3: To run the server, use: `node ytgbfs.js`.  
* 4: Make any request on port `54521` with `/feedback` endpoint:
   * 4.1: A POST request with the following body is accepted:
     * 4.1.1: `{ "message": "Your feedback message here." }`. 
* 5: Server will return one of the following:
   * 5.1: `200 OK` status, if sending process was ok.
   * 5.2: `400 BAD REQUEST` status, if request does not follow the specified format above.
   * 5.3: `500 INTERNAL SERVER ERROR` status, if something went wrong on the sending process.

## Tips
It is highly recommended to use the `pm2` process manager to recover from internal failures and automatize the service providing.

## Licensing
MIT License.
