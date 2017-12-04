- To create assignments, we'll add one function to SkylightClient.js so that we can retrieve the extension ID. This will be used to associate assignments that we create with this extension. 

- In tutorial.js, we'll use the members of the group from the previous tutorial. 

- First, GET all assignments for these users and then DELETE them.

- Then, for each user, we'll get the assignment data.

- The assignment data contains to whom the assignment should be assigned, the extension ID (provided by SkylightClient.js), the name of the assignment, and an array of sequence data.

- We'll add the root sequence to the assignment. This sets the "rootSequence" field in the assignment data, as well as adds the sequence data to the array of sequences in the assignment.

- Sequences don't necessarily require an ID to be specified; the server will generate the ID if not provided. That said, if a reference to the sequence is required before the sequence is created (as in a link from an openSequence component), then the ID should be generated beforehand.

- The sequence data contains a field called "cards," which is an array of all of the cards that this sequence contains. 

- Cards have their own fields (as described in the Swagger API documentation), including a layout and a component.

- A layout contains data pertaining to what type of text or media is shown on the card. Within the layout data, the layoutType is specified, along with any values specific to that layout type. These layoutTypes and values can be found in the Swagger API documentation.

- A component contains data pertaining to the action related to that card. For example, an openSequence componentType will allow a user to navigate to another sequence by tapping on the card. Another example of a component is the capturePhoto component, which allows users to take photos by tapping on the card.

- A card does not require a component.

- Once the card data is populated, we add it to the array of cards, which is then set in the sequence's "cards" field.

- Once we have all of the data for the assignment, sequences, and cards, we'll POST that data to the /assignment/assignments endpoint in order to create (and assign) the assignment.