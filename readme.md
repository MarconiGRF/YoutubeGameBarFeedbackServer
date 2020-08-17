# Youtube GameBar Feedback Server
A simple server to implement [YTGBO](https://github.com/MarconiGRF/YoutubeGameBarOverlay)'s Feedback system. It converts HTTP formatted request into SMTP message and sends it to the desired destination.

## Usage
* 1: Clone this repository.  
* 2: On repository's root, run `npm install`.
* 3: Rename `smtp-config-sample.json` to `smtp-config.json` and change its placeholder values to yours accordingy.
* 4: To run the server, use: `node ytgbfs.js`.  
* 5: Make any request on port `54521` with `/feedback` endpoint:
   * 5.1: A POST request with the following body is accepted:
     * 5.1.1: `{ "message": "Your feedback message here." }`. 
* 6: Server will return one of the following:
   * 6.1: `200 OK` status, if sending process was ok.
   * 6.2: `400 BAD REQUEST` status, if request does not follow the specified format above.
   * 6.3: `500 INTERNAL SERVER ERROR` status, if something went wrong on the sending process.

## Tips
It is highly recommended to use the `pm2` process manager to recover from internal failures and automatize the service providing.

## Licensing
MIT License.
