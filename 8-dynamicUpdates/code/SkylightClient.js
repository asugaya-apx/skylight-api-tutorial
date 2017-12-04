/*** Imports ***/

//Request is the node library used for making REST calls
const request = require('request');

//jsonwebtoken is the node library used to decode json web tokens (JWTs)
const jsonwebtoken = require('jsonwebtoken');

//promise is used to construct promises
const Promise = require('promise');

//Mqtt is the node library used for making calls through MQTT
const mqtt = require('mqtt');

/*** Skylight Client Class ***/
class SkylightClient {

	/*** Tutorial: 1-credentials ***/
	constructor(credentials, verbose = false) {
		this.credentials = credentials;
		this.authResponse = {};
		this.verbose = verbose;
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

	/*** Tutorial: 3-mqttAuth ***/
	async authenticateMQTT(onMessageCallback){
		const credentials = this.credentials;
		const authResponse = this.authResponse;
		return new Promise(function(resolve, reject){
			//Generate a unique client ID for the MQTT channel
			const mqttClientId = [
				credentials.realm
				, authResponse.userId
				, Math.random().toString(16).substr(2, 8)
			].join('-');

			//The MQTT username which is <<realm>>/<<userid>>
			const mqttUsername = [
				credentials.realm
				, authResponse.userId
			].join('/');

			//Establish an MQTT connection using the above generated credentials
			console.log('INFO: Connecting to Skylight Notification Service')
			const mqttClient  = mqtt.connect(credentials.mqttEndpoint, 
				{ 	username: mqttUsername
					, password: authResponse.jwt
					, clientId: mqttClientId });

			//On connect, we'll subscribe to the extension's topic. Note that we can only
			// subscribe to the topic we're authorized to subscribe to.
			mqttClient.on('connect', () => {
				console.log('INFO: Successfully connected to Skylight Notification Service')

				//This is the topic that we will subscribe to using MQTT that gives us notifications about updates to assignments
				const assignmentTopic = [
					'realms'
					, credentials.realm
					, 'users'
					, authResponse.userId
					, '#'
				].join('/')

				mqttClient.subscribe(assignmentTopic)
				console.log('INFO: Successfully subscribed to assignment topic')

				const eventsTopic = [
					'realms'
					, credentials.realm
					, 'events'
					, '#'
				].join('/')
				mqttClient.subscribe(eventsTopic);
				console.log('INFO: Successfully subscribed to events topic')

				resolve();
			});

			//New message handler
			mqttClient.on('message', (topic, message, packet) => {
				onMessageCallback(JSON.parse(message.toString()));
			});

			//Error handler
			mqttClient.on('error', (err) => {
				console.log('ERROR: ', err)
				reject(err);//Technically this might get called later on, but as a promise cannot be rejected after being fulfilled, this can be used to catch errors pertaining to the initial connection
			});

			//Reconnect handler
			mqttClient.on('reconnect', () => {
				console.log('INFO: Reconnecting to Skylight Notification Service')
			});
		});
	}

	/*** Tutorial: 4-restCall ***/
	//This function is called before all API calls that require authentication--this will populate the headers with the proper credentials (assuming login as been called)
	//Take a route and body and build the http options with appropriate headers
	buildOptions(route, body){
		return {
			url: this.credentials.restEndpoint + route
			, headers: {
				authorization: 'Bearer ' + this.authResponse.jwt
			}
			, json: body
		}
	}
	
	async api(requestFunction, route, body){
		const options = this.buildOptions(route, body);
		const verbose = this.verbose;

		//We'll log the request if verbose
		if(verbose){
			console.log("\n");
			console.log("_______");
			console.log("VERBOSE: Calling " + options.url + " with request headers: ");
			console.log(options.headers);
			if(body != null){
				console.log("and body: ")
				console.log(body);
				console.log("\n");
			}
		}

		//We'll return a promise that calls the request function (either get, post, put, or delete)
		return new Promise(function(resolve, reject){
			requestFunction(options, (err, res, body) => {

				if(res.statusCode < 200 || res.statusCode >= 300){
					//If the status isn't 2XX, something went wrong--reject with the error
					console.log("Error with call to " + options.url);
					console.log(res.statusCode);
					reject(body);
				}else{
					//Otherwise, we're all good--return with the result

					//Make sure what we're getting back is a JSON object
					
					if(typeof body == "string" && body !== ""){
						try{
							body = JSON.parse(body);
						}catch(e){
							reject(e);
						}
					}

					//First, log if we're in verbose mode
					if(verbose){
						console.log("\n");
						console.log("VERBOSE: Result for call to " + options.url + ":");
						console.log(body);
						console.log("------");
						console.log("\n");
					}

					//Then return the result (the body of the response, which will be some sort of JSON object)
					resolve(body);
				}
			});
		});
	}
	/*** REST API wrappers ***/
	//These functions abstract out the calls to the API, which, in tandem with the buildOptions function above, takes care of authentication
	async apiGet(route, body) {
		return await this.api(request.get, route, body);
	}

	async apiPost(route, body) {
		return await this.api(request.post, route, body);
	}

	async apiPut(route, body) {
		return await this.api(request.put, route, body);
	}

	async apiDelete(route, body) {
		return await this.api(request.delete, route, body);
	}

	/*** Tutorial: 6-assignments ***/
	get extensionId(){
		return this.authResponse.userId;
	}
}


//Export this code for use by other classes
module.exports = SkylightClient;
