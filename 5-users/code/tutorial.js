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

	/*** Tutorial: 4-restCall ***/
	const users = await client.apiGet("/authentication/users");
	console.log(`There are ${users.length} users in this realm.`);

	/*** Tutorial: 5-users ***/
	//Let's get users in a specific group using the group's name
	const selectGroupName = "API Tutorial Group";

	//First, we'll get the list of all groups
	const allGroups = await client.apiGet("/authentication/groups");

	//Second, go through the groups and find the one with the matching one, if any
	var selectGroupId = null;
	allGroups.forEach(function(group){
		if(group.name !== selectGroupName)return;//In javascript, return in a forEach is the same as a continue in a for loop
		selectGroupId = group.id;
	});

	//Third, if the group exists, get that group from the server. Otherwise, create the group
	if(selectGroupId === null){
		const newGroupData = {};
		newGroupData.description = "Group created by Tutorial";
		newGroupData.name = selectGroupName;

		const newGroupResponse = await client.apiPost("/authentication/groups", newGroupData);
		selectGroupId = newGroupResponse.id;
	}
	var selectGroup = await client.apiGet(`/authentication/groups/${selectGroupId}`);
	
	//If there are no members, get the tutorial user and add them
	if(typeof selectGroup.members === "undefined"){
		var tutorialUserId = null;
		//"users" is from Tutorial 4
		users.forEach(function(user){
			if(user.username !== "tutorial.user")return;
			tutorialUserId = user.id;
		});

		//If the tutorial user doesn't exist, create it
		if(tutorialUserId === null){
			const newUserData = {
				"firstName": "Tutorial"
				, "lastName": "User"
				, "role": "user"
				, "username": "tutorial.user"
				, "password": "turtlecurelozenge"
			}
			const newUser = await client.apiPost("/authentication/users", newUserData);
			tutorialUserId = newUser.id;
		}

		//Add the user to the group
		await client.apiPut(`/authentication/users/${tutorialUserId}/groups/${selectGroupId}`);

		//Get the group again to make sure we refresh the members list
		selectGroup = await client.apiGet(`/authentication/groups/${selectGroupId}`);
	}

	//Fourth, print out the number of members and the names of each member
	console.log(`${selectGroup.members.length} member(s) in the group "${selectGroupName}"`);
	if(selectGroup.members.length > 0) console.log("Members include:")
	selectGroup.members.forEach(function(user){
		console.log(`    ${user.username}`);
	});
}

//Run our main function
main().then(function(){
	console.log("Tutorial ran successfully!");
}).catch(function(err) {
	console.log("Tutorial ran into a challenge:");
	console.log(err);
});
