- As before, no changes are necessary in SkylightClient.js

- In tutorial.js, we'll add some code right after we've POSTed and created the assignment.

- After creating the assignment, we'll get the information for the first card. As noted in the comments in the code, a production deployment should have separate classes for cards, sequences, and assignments, which would store the ID themselves.

- We'll create a function that updates the text of the card shown in the layout. We first GET the card information. After this, we update the card layout's "text" field, then we update the card using a PUT call.

- We cycle through different strings that should go into the text layout. This function then calls itself after 2 seconds have passed.

- While this example shows a cyclical function updating the card information, this is to show that asynchronous events that occur after the creation of an assignment (such as an update in the customer's backend) can be reflected in cards in real-time without having to recreate the assignment.