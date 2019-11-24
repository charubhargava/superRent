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
    let query = `SELECT * 
                    FROM vehicles 
                    WHERE status<>'maintenance'`;
    if (carType) {
        query += ` AND vtname='${carType}'`;
    }
    if (location) {
        query += ` AND location='${location}'`;
    }

    if(startTime || endTime) {
        let notInQuery = ` AND vehicles.vid NOT IN (SELECT reservation.vid FROM reservation `
        if(startTime && endTime) {
            notInQuery += ` WHERE fromDate<='${startTime}' AND toDate>='${endTime}'`;
        } else if (startTime) {
            baseQuery += ` WHERE fromDate<='${startTime}'`;
        } else if (endTime) {
            baseQuery += ` WHERE toDate>='${endTime}'`;
        }
        notInQuery += ' )';
        query += notInQuery;
    }
    query += `
        ORDER BY location ASC, vtname ASC;`
    return runQuery(query);
}

const newCustomer = (dlicense, name, address) => {
    let query = `
        INSERT INTO Customer(dlicense, name, address)
        VALUES ('${dlicense}', '${name}', '${address}')
        RETURNING *;`
    return runQuery(query);
}

const createReservation = (carType, vid, startDate, endDate, dlicense) => {
    let query = `INSERT INTO Reservation (vtName, vid, dlicense, fromDate, toDate) 
                SELECT '${carType}', ${vid}, Customer.dlicense, '${startDate}', '${endDate}'
                FROM Customer
                WHERE Customer.dlicense='${dlicense}'
                RETURNING *;`;
    return runQuery(query);
}

const getVehicles = (confNo) => {
    console.log(confNo);
    let query = `
        SELECT R.confNo, R.vtName, V.vid, V.vlicense, V.make, V.model, V.year, V.color, V.odometer, R.fromDate, R.toDate, R.dlicense
        FROM Reservation R, Vehicles V
        WHERE R.confNo='${confNo}' AND V.vid=R.vid AND V.status='available';`;
    return runQuery(query);
}

const rent = (confNo, dlicense, cardName, cardNo, expiration) => {
    let query = `
        INSERT INTO Rent (vid, dlicense, fromDate, toDate, odometer, cardName, cardNo, expDate, confNo)
        SELECT R.vid, R.dlicense, R.fromDate, R.toDate, V.odometer, '${cardName}', '${cardNo}', '${expiration}', R.confNo
        FROM Reservation R, Vehicles V
        WHERE R.confNo='${confNo}' AND V.vid=R.vid AND R.dlicense='${dlicense}'
        RETURNING *;`;
    console.log(query);
    return runQuery(query);
}

const setVehicleStatusToRented = (vid) => {
    let query = `
        UPDATE Vehicles SET status='rented'
        WHERE Vehicles.vid='${vid}'`
    return runQuery(query);
}

const returnVehicle = (confNo, date, odometer, fullTank, value) => {
    let query = `
        INSERT INTO RETURN (rid, date, odometer, fulltank, value)
        SELECT Rent.rid, '${date}', '${odometer}', '${fullTank}', '${value}'
        FROM Rent
        WHERE Rent.confNo='${confNo}' AND Rent.fromDate<='${date}'
        RETURNING *;`
    return runQuery(query);
}

const setVehicleStatusToAvailable = (vid) => {
    let query = `
        UPDATE Vehicles SET status='available'
        WHERE Vehicles.vid='${vid}'`
    return runQuery(query);
}

const runQuery = (query) => {
    return new Promise(function(resolve, reject) {
        pool.query(query, (error, results) => {
            if (error) {
                console.log("error :" + error  + "with query: " + query);
                reject("SQL ERROR: " + error);
            } else {
                var result = {
                    rows: results.rows,
                    query: query
                }
                console.log(result);
                resolve(result);
            }
        }); 
    });
}

module.exports = {
    viewVehiclesAvailable,
    createReservation,
    newCustomer,
    getVehicles,
    rent,
    setVehicleStatusToRented,
    returnVehicle,
    setVehicleStatusToAvailable,
};