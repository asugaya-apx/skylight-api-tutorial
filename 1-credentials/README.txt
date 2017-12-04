	- Let's talk about authentication for the REST API in Skylight. 

	- Every call to the REST API requires a JSON Web Token, also known as a JWT.
	
	- This JWT contains information that tells the API endpoints who you are.
	
	- To acquire a JWT from the server, the code will first need to log in using the proper API credentials.

	- There are two ways to acquire these credentials. 

	- First, if you have administrator access to the domain, log in to the website as that account. Then, scroll down and select "Domain settings" on the left navigation menu.

	- From there, click on "API Credentials" at the top. 

	- If your credentials don't already exist, create a new one by clicking on the plus button.

	- Fill out the name and description and hit "create"

	- Once the credential is listed, select "Show Credentials" for that row. Take note of the username and password, which will be used to get a JWT from the server. 

	- You can ignore the user id for now.

	- The second way to obtain these credentials is to simply ask the administrator for your domain.

	- Once we have the credentials, we'll place them into a file in our project (credentials.js)

	- We'll create a SkylightClient class which will abstract certain actions, such as REST calls. This class will also store the credentials.

	- In tutorial.js, we'll start by instantiating this class. We'll add more to the SkylightClient class as well as the main tutorial file as we progress forward.

	- To run this example and all others in this tutorial, navigate to the code directory in a terminal or command line, then type "node tutorial.js"

	- One important note is that as we build upon this tutorial.js, we'll be creating one large file with very few functions abstracted out. This is for simplicity's sake only. For production-level deployments, proper use of functions and classes is recommended.