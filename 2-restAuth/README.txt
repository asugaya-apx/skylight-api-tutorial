	- Now that we have our credentials, let's take a look at what logging in to the REST API looks like.

	- We'll be modifying our SkylightClient class to log in using our extension's username and password.

	- The login URL will be the API URL, which will look something like "https://api.skylight.upskill.io/v1", plus the login endpoint, which is '/authentication/login/realms/' and the realm.

	- Ths login request is a POST HTTP call to the login URL with the username, password, and realm as part of the JSON body

	- Upon a successful login, we'll receive the JWT in the "access_token" field.

	- The user ID is embedded into the JWT, so we'll decode it and store it for later, along with the JWT.

	- Back in the main tutorial.js file, we'll call this REST login method.

	- When running this tutorial using "node tutorial.js", you may run into dependency errors. If this is the case, run "npm install" in the code directory first to install the dependencies.