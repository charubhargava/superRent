const Pool = require('pg').Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true  
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

    let baseQuery = `SELECT * FROM vehicles WHERE status<>'maintenance' AND location=${location}`;
    if (carType) {
        baseQuery += ` AND carType=${carType}`;
    }

    let notInQuery = `AND vid NOT IN (SELECT vid FROM reservation `
    if (startTime) {
        baseQuery += ` AND startTime=${startTime}`;
    }
    if (endTime) {
        baseQuery += ` AND endTime=${endTime}`;
    }

    notInQuery+= ` );`; //TODO add order by or group by
    let fullQuery = baseQuery + notInQuery;

    return runQuery(fullQuery);
   
}


const runQuery = (query) => {
    return new Promise(function(resolve, reject) {
        pool.query(query, (error, results) => {
            if (error) {
                reject("SQL ERROR: " + error);
            } else {
                results.rows.query = fullQuery;
                resolve(results.rows);
            }
        }); 
    });
}

module.exports = {
    viewVehiclesAvailable
};