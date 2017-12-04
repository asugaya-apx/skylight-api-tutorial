/*** Imports ***/

//Request is the node library used for making REST calls
const request = require('request');

//jsonwebtoken is the node library used to decode json web tokens (JWTs)
const jsonwebtoken = require('jsonwebtoken');

//promise is used to construct promises
const Promise = require('promise');

/*** Skylight Client Class ***/
class SkylightClient {

	/*** Tutorial: 1-credentials ***/
	constructor(credentials) {
		this.credentials = credentials;
		this.authResponse = {};
	}

	/*** Tutorial: 2-restAuth ***/
	async authenticateREST(){
		const credentials = this.credentials;
		const authResponse = this.authResponse;
		return new Promise(function(resolve, reject){
			const httpOptions = {
				url: credentials.restEndpoint + '/authentication/login/realms/'+credentials.realm
				, json: {
					username: credentials.username,
					password: credentials.password,
					realm: credentials.realm
				}
			}

			//POST to the login endpoint to get a token for your session
			request.post(httpOptions, (err, res, body) => {
				console.log('INFO: Authenticating to Skylight API')
				if (err) reject(err);

				if (res.statusCode !== 200) {
					reject('ERROR: Authentication error. Status code: ' + res.statusCode);
				}

				console.log('INFO: Successfully authenticated to Skylight API')
				
				//Now that we're logged in, set up some credentials for MQTT
				authResponse.jwt = body.access_token; //This will be important for later

				//User ID of the integration which comes back as sub in the token
				authResponse.userId = jsonwebtoken.decode(authResponse.jwt).sub;

				resolve();
			});
		});
	}
}


//Export this code for use by other classes
module.exports = SkylightClient;
