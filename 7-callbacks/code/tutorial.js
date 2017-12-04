/*** Imports ***/
const SkylightClient = require('./SkylightClient');
const credentials = require('./credentials');
const uuidv4 = require('uuid/v4');


/*** Main Code ***/
async function main() {
	//Create a new client
	const client = new SkylightClient(credentials);
	
	/*** Tutorial: 2-restAuth ***/
	//Authenticate to REST
	await client.authenticateREST();

	/*** Tutorial: 3-mqttAuth ***/
	//This is our messages callback
	async function onMessageCallback(messageData){
		/*** Tutorial: 7-callbacks ***/
		
		//Check to make sure we're only dealing with card updates
		if(messageData.eventType !== "cards")return;
      	if(messageData.event !== "update")return;

      	const assignmentId = messageData.assignmentId;
      	const sequenceId = messageData.sequenceId;
      	const cardId = messageData.cardId;

      	//Get the updated card information
      	const updatedCardInfo = await client.apiGet(`/assignment/assignments/${assignmentId}/sequences/${sequenceId}/cards/${cardId}`);
      	const updatedComponent =  updatedCardInfo.component;
      	if(updatedComponent === null || typeof updatedComponent === "undefined")return;
      	if(updatedComponent.componentType === "capturePhoto") {
      		//Captured photos are stored in captures
      		console.log("Captured photos: ");
      		console.log(updatedComponent.captures);
      	} else if (updatedComponent.componentType === "completion") {
      		//We'll check to see if the component has been completed.
      		//Note that if the card has been completed in the past, any update to the card will trigger this (with the completed property set to true)
      		//In production environments, we'll want to keep track of if it was completed before or not, and only fire the completed event if the card goes from being incomplete to completed.
      		if(!updatedComponent.completed)return;
      		console.log("Card completed!");

      	}

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

	/*** Tutorial: 6-assignments ***/
	//Start by deleting all assignments for users in this group
	//Get the list of assignments for this user and delete them
	const userIds = selectGroup.members.map(user => user.id).join(",");
	const assignments = await client.apiGet(`/assignment/assignments?userIds=${userIds}`);
	for(let assignment of assignments){
		await client.apiDelete(`/assignment/assignments/${assignment.id}`);
	}


	//Using the members of the group from before, we're going to create assignments for each member
	for(let user of selectGroup.members){

		//Get the assignment data
		const assignmentData = getAssignmentDataForUser(user, client);
		
		//Push the data to the server
		await client.apiPost("/assignment/assignments", assignmentData);
		console.log("Pushed assignment to " + user.username);
	};
	
}

/*** Tutorial: 6-assignments ***/
function getAssignmentDataForUser(user, client){
	//We create the assignment data and return it here.
	//In a production deployment, it would be recommended that the assignments/sequences/cards be turned into models and classes instead of simple JSON dictionaries
	const assignmentData = {};
	assignmentData.assignedTo = user.id;
	assignmentData.integrationId = client.extensionId;
	assignmentData.name = "Tutorial Assignment";
	
	assignmentData.sequences = [];

	addRootSequenceToAssignment(assignmentData);
	return assignmentData;
}

function addRootSequenceToAssignment(assignmentData){
	const sequenceData = {};
	//We can set the id to be whatever we'd like
	sequenceData.id = uuidv4();

	//Set the root sequence to be this sequence
	assignmentData.rootSequence = sequenceData.id;
	
	//Add this sequence data to the list of sequences
	assignmentData.sequences.push(sequenceData);

	//Add some cards to this sequence.
	const cards = [];

	//As before, it would be recommended in a production environment to turn cards into a class instead of using the raw data structure
	cards.push({
		"footer":"Tutorial Assignment Footer 1"
		, "header":"Tutorial Assignment Header 1"
		, "id": uuidv4()
		, "label": "Step 1"
		, "layout": {
			"layoutType": "text"
			, "text": "Hello "
			, "textSize": "large"
		}
		, "selectable": true
		, "size": 1
		, "position": 1
	});

	cards.push({
		"footer":"Tutorial Assignment Footer 2"
		, "header":"Tutorial Assignment Header 2"
		, "id": uuidv4()
		, "label": "Step 2"
		, "layout": {
			"layoutType": "text"
			, "text": "World"
			, "textSize": "large"
		}
		, "selectable": true
		, "size": 1
		, "position": 2
	});

	const childSequenceData = addChildSequenceToAssignment(assignmentData);

	cards.push({
		"footer":"Tutorial Assignment Footer 3"
		, "header":"Tutorial Assignment Header 3"
		, "id": uuidv4()
		, "label": "Step 3"
		, "layout": {
			"layoutType": "text"
			, "text": "Tap to dive into next sequence"
			, "textSize": "small"
		}
		, "component": {
			"componentType": "openSequence"
			, "sequenceId": childSequenceData.id
		}
		, "selectable": true
		, "size": 1
		, "position": 3
	});
	sequenceData.cards = cards;


}

function addChildSequenceToAssignment(assignmentData){
	const sequenceData = {};
	//We can set the id to be whatever we'd like
	sequenceData.id = uuidv4();
	
	//Add this sequence data to the list of sequences
	assignmentData.sequences.push(sequenceData);

	//Add some cards to this sequence.
	const cards = [];

	//As before, it would be recommended in a production environment to turn cards into a class instead of using the raw data structure
	cards.push({
		"footer":"Child Footer 1"
		, "header":"Child Header 1"
		, "id": uuidv4()
		, "label": "SubStep 1"
		, "layout": {
			"layoutType": "text"
			, "text": "Hi!"
			, "textSize": "large"
		}
		, "selectable": true
		, "size": 1
		, "position": 1
	});

	cards.push({
		"footer":"Child Footer 2"
		, "header":"Child Header 2"
		, "id": uuidv4()
		, "label": "SubStep 2"
		, "layout": {
			"layoutType": "text"
			, "text": "I'm a child sequence."
			, "textSize": "small"
		}
		, "selectable": true
		, "size": 1
		, "position": 2
	});

	/*** Tutorial: 7-callbacks ***/
	//We'll add a couple cards that have callbacks associated with them
	cards.push({
		"footer":"Child Footer 3"
		, "header":"Child Header 4"
		, "id": uuidv4()
		, "label": "SubStep 3"
		, "layout": {
			"layoutType": "text"
			, "text": "Tap to mark complete."
			, "textSize": "small"
		}
		, "component": {
			"componentType": "completion"
		}
		, "selectable": true
		, "size": 1
		, "position": 3
	});

	cards.push({
		"footer":"Child Footer 2"
		, "header":"Child Header 2"
		, "id": uuidv4()
		, "label": "SubStep 4"
		, "layout": {
			"layoutType": "text"
			, "text": "Tap to capture photo."
			, "textSize": "small"
		}
		, "component": {
			"componentType": "capturePhoto"
		}
		, "selectable": true
		, "size": 1
		, "position": 4
	});


	sequenceData.cards = cards;

	return sequenceData;
}

//Run our main function
main().then(function(){
	console.log("Tutorial ran successfully!");
}).catch(function(err) {
	console.log("Tutorial ran into a challenge:");
	console.log(err);
});
