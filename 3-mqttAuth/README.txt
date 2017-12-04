- Now that we've logged in using the REST interface, let's connect and subscribe to the MQTT channels.

- The MQTT channels are where we receive real-time updates about cards, sequences, assignments, user presence, and other events.

- To connect to MQTT, we'll need a unique client id and a specific username, which is the realm slash user id (which is different from the client id).

- Specifying the client id, username, password (which is the JWT from the REST login), and MQTT endpoint, we can connect to the MQTT service.

- The MQTT endpoint is something like "mqtts://mqtt.skylight.upskill.io"

- After we successfully connect, there are two topics we should subscribe to. These topics are the assignments topic (to receive card updates) and the events topic (to receive events like user presence).

- See the code for the specifics around the resource strings for those topics.

- We'll set up a message handler callback that gets called when we receive a message. This will get used in a later tutorial.

- It should be noted that this particular NodeJS MQTT library will automatically reconnect if the connection drops. For other libraries and other languages, you may need to manually reconnect.

- Back in the main tutorial.js code, we'll simply connect to MQTT server and confirm that we can successfully subscribe to the topics.

- For now, we'll leave the onMessageCallback blank. In a future tutorial, we'll see how to listen for user actions using this callback.