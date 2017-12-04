/*** Imports ***/
const SkylightClient = require('./SkylightClient');
const credentials = require('./credentials');


/*** Main Code ***/
async function main() {
	//Create a new client
	const client = new SkylightClient(credentials);
	
}

//Run our main function
main().then(function(){
	console.log("Tutorial ran successfully!");
}).catch(function(err) {
	console.log("Tutorial ran into a challenge:");
	console.log(err);
});
