- For this tutorial, no changes are necessary in SkylightClient.js.

- We'll start by adding two new cards to the child sequence in tutorial.js.

- One card has a component of componentType "completion"

- The "completion" component allows users to mark a sequence as complete, which will send an update to the extension over MQTT.

- The second card has a component of componentType "capturePhoto"

- The "capturePhoto" component allows users to capture a photo, which will send an update to the extension over MQTT.

- After we add these cards, we'll modify the onMessageCallback in tutorial.js. This is the callback we left blank in the previous tutorial.

- When a card component's action is performed, whether a photo is captured or a card is marked as complete, a message is sent to our extension over MQTT signifying that the card has been updated. 

- In our callback, we'll listen for messages that are specific to card updates by filtering on the event and eventType.

- Along with the event and eventType, the message contains the data necessary to retrieve the card's information. This includes the assignment ID, the sequence ID, and the card ID.

- We perform a GET call to retrieve the card information.

- Once we have the updated card information, we check the component. If the card has no component, we simply return.

- Based on the componentType, we perform separate actions.

- If the user has captured a photo, we'll log the URLs for the captured photos.

- If the user has completed a card, we'll log that the card has been completed.

- Any action, of course, can be performed in this callback. For example, a user marking a sequence as complete can lead to a callback that updates the customer's backend, marking the workflow as completed using that particular backend's APIs.