# superRent
Repository for CPSC 304 Project Part 3.


Instructions to set up the project.

1. Clone this repository.
2. Make sure you have node.js (https://nodejs.org/en/download/), npm (https://docs.npmjs.com/cli/install) and postgres (https://www.postgresql.org/docs/9.3/tutorial-install.html) installed.
3. Navigate to the `superRent` folder and run `npm install` to update dependencies.
4. Navigate to the folder `superRent/sqlScripts`.
5. Start up psql cli using `psql -U postgres`. Use the password you created during setup to authenticate postgres. 
6. Run the script initDB.sql using `\i initDB.sql`. This creates all the tables and initializes test data. 
7. Return to the superRent folder and run the server using `node server.js`
8. Navigate the http://localhost:5000 to use the superRent web interface. 