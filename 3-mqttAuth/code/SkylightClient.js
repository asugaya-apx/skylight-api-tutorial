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
}


//Export this code for use by other classes
module.exports = SkylightClient;
