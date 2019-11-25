# superRent
<h3>Repository for CPSC 304 Project Part 3.</h3>


<h4>Instructions to set up the project:</h4>


<h5>Installing Software</h5>

1. Clone this repository.
2. Make sure you have node.js (https://nodejs.org/en/download/), npm (https://docs.npmjs.com/cli/install) and postgres (https://www.postgresql.org/docs/9.3/tutorial-install.html) installed.
3. Navigate to the `superRent` folder and run `npm install` to update dependencies. This may install a few node libraries such as `express`, `pg`.

<h5>Setting up the database</h5>

1. Navigate to the folder `superRent/sqlScripts`.
2. Start up psql cli using `psql -U postgres`. Use the password you created during setup to authenticate postgres. 
3. Run the script initDB.sql using `\i initDB.sql`. This creates all the tables and initializes test data. 
4. Open the file `superRent/db.js` and replace the credentials in the variable `localPool` with your local postgres credentials.

<h5>Running the app</h5>

1. Navigate to the folder `superRent` and run the server using `node server.js`
2. Navigate to http://localhost:5000 to use the superRent web interface. 
