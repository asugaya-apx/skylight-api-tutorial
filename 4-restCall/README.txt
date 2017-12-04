- Using the JWT, we can now perform REST calls to the Skylight services.

- Every call to the Skylight services requires an authorization header with the value "Bearer " and the JWT.

- In SkylightClient.js, we've created a function that does exactly this, called "buildOptions". The function is called as such because it builds options to be passed into the HTTP request call.

- The rest of the API call functionality is in the "api" function, where we do a check for the status code, as well as parsing the results.

- Finally, we add a few helper functions that make calling specific REST verbs easier, like GET, POST, PUT, and DELETE.

- In tutorial.js, we perform a sample GET request on the /authentication/users endpoint to get the users in this realm.