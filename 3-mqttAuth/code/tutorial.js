/*** Imports ***/
const SkylightClient = require('./SkylightClient');
const credentials = require('./credentials');


/*** Main Code ***/
async function main() {
	//Create a new client
	const client = new SkylightClient(credentials);
	
	/*** Tutorial: 2-restAuth ***/
	//Authenticate to REST
	await client.authenticateREST();

	/*** Tutorial: 3-mqttAuth ***/
	//This is our messages callback
	function onMessageCallback(messageData){
		
	}
	//Authenticate and subscribe to MQTT
	await client.authenticateMQTT(onMessageCallback);
}

//Run our main function
main().then(function(){
	console.log("Tutorial ran successfully!");
}).catch(function(err) {
	console.log("Tutorial ran into a challenge:");
	console.log(err);
});
