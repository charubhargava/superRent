const Pool = require('pg').Pool
// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: true
//   });

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'pass!@#$',
    port: 5432,
});

const DEFAULT_LOCATION = "Vancouver";

//////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////            CUSTOMER TRANSACTIONS           ///////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Build the following query: 
 * select * from vehicles V where V.status<>'maintenance' and V.location=location 
 * and V.cartype=cartype and V.vid NOT IN (select R.vid from Reservation R where
 * dates overlap)
 * @param {*} request 
 * @param {*} response 
 */
const viewVehiclesAvailable = (carType, location, startTime, endTime) => { 
    if (location == null || location == "") {
        location = DEFAULT_LOCATION;
    }

    let baseQuery = `SELECT * FROM vehicles WHERE status<>'maintenance' AND location='${location}'`;
    if (carType) {
        baseQuery += ` AND vtname='${carType}'`;
    }

    let notInQuery = ` AND vid NOT IN (SELECT vid FROM reservation `
    if (startTime) {
        baseQuery += ` AND startTime='${startTime}'`;
    }
    if (endTime) {
        baseQuery += ` AND endTime='${endTime}'`;
    }

    // Check for overlaps
    if(startTime && endTime) {
        notInQuery += ` WHERE endTime >= ${startTime} AND startTime <= ${endTime}`;
    }

    notInQuery+= ` );`; //TODO add order by or group by
    let fullQuery = baseQuery + notInQuery;

    console.log(fullQuery);
    return runQuery(fullQuery);
   
}

const createReservation = (carType, location, startDate, endDate, dlicense, name, address) => {
    let insertReservationQuery = `INSERT INTO Reservation (confNo, vtName, dlicense, fromDate, toDate) VALUES (DEFAULT, ${carType}, ${dlicense}, ${startDate}, ${endDate});`;
    return runQuery(insertReservationQuery);
}

const runQuery = (query) => {
    return new Promise(function(resolve, reject) {
        pool.query(query, (error, results) => {
            if (error) {
                reject("SQL ERROR: " + error);
            } else {
                var result = {
                    rows: results.rows,
                    query: query
                }
                resolve(result);
            }
        }); 
    });
}

module.exports = {
    viewVehiclesAvailable
};