- For this part of the tutorial, we won't need to modify SkylightClient.js.

- In tutorial.js, we first set the variable containing the group name we want to use.

- Then, we perform a GET call to retrieve all groups from the Skylight services.

- For each of these groups, see if the name matches the variable containing the group name we want to use. If one matches, store the ID for that group.

- If no such group exists, create a new group using a POST call to the /authentication/groups endpoint.

- In the response to this POST request, we'll receive the ID of the group.

- Whether the group was created or already existed, use a GET call to retrieve that group's information using the group's ID.

- If that group contains no members, add the Tutorial User to the group. Go through the previously retrieved users list (from the previous tutorial) and see if the user already exists in the realm. If not, create the user by posting data to the /authentication/users endpoint. Then, use a PUT call to place the user into the group. Retrieve the group's information from the server again to ensure we have the latest information.

- For each of the members in the group, we'll list out their names.