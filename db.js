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
                    FROM Vehicles, VehicleType
                    WHERE VehicleType.vtname=Vehicles.vtname AND status<>'maintenance'`;
    if (carType) {
        query += ` AND Vehicles.vtname='${carType}'`;
    }
    if (location) {
        query += ` AND location='${location}'`;
    }

    if (startTime || endTime) {
        let notInQuery = ` AND Vehicles.vid NOT IN (SELECT reservation.vid FROM reservation `
        if (startTime && endTime) {
            notInQuery += ` WHERE fromDate<='${endTime}' AND toDate>='${startTime}'`;
        }
        notInQuery += ' )';
        query += notInQuery;
    }
    query += `
        ORDER BY location ASC, Vehicles.vtname ASC;`
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

const getVehicleFromReservation = (confNo) => {
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
    return runQuery(query);
}

const setVehicleStatusToRented = (vid) => {
    let query = `
        UPDATE Vehicles SET status='rented'
        WHERE Vehicles.vid='${vid}'`
    return runQuery(query);
}

const getInfoForReturn = (confNo) => {
    let query = `
        SELECT *
        FROM Rent, Vehicles, VehicleType
        WHERE Rent.confno='${confNo}' AND Vehicles.vid=Rent.vid AND VehicleType.vtname = Vehicles.vtname`;
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

const setVehicleStatusToAvailableAndUpdateOdometer = (vid, odometer) => {
    let query = `
        UPDATE Vehicles SET status='available', odometer='${odometer}'
        WHERE Vehicles.vid='${vid}'`
    return runQuery(query);
}

const getDailyRentalsReport = (reportDate) => {
    let query = `
        SELECT *
        FROM Vehicles, Rent
        WHERE vehicles.vid=Rent.vid AND vehicles.vid IN (
            SELECT Rent.vid
            FROM Rent
            WHERE fromDate>='${reportDate + ' 00:00:00'}' AND fromDate<='${reportDate + ' 23:59:59'}')
        ORDER BY location ASC, vtname ASC;`
    return runQuery(query);
}

const getDailyRentalsReportForBranch = (reportDate, location) => {
    let query = `
        SELECT *
        FROM Vehicles, Rent
        WHERE vehicles.vid=Rent.vid AND Vehicles.location='${location}' AND vehicles.vid IN (
            SELECT Rent.vid
            FROM Rent
            WHERE fromDate>='${reportDate + ' 00:00:00'}' AND fromDate<='${reportDate + ' 23:59:59'}')
        ORDER BY vtname ASC;`
    return runQuery(query);
}

const getDailyReturnsReport = (reportDate) => {
    let query = `
        SELECT Vehicles.*, Return.*
        FROM Vehicles, Return, Rent
        WHERE Vehicles.vid=Rent.vid AND Rent.rid=Return.rid AND Return.rid IN (
            SELECT Return.rid
            FROM Return
            WHERE fromDate>='${reportDate + ' 00:00:00'}' AND fromDate<='${reportDate + ' 23:59:59'}')
        ORDER BY location ASC, vtname ASC;`
    return runQuery(query);
}

const getDailyReturnsReportForBranch = (reportDate, location) => {
    let query = `
        SELECT Vehicles.*, Return.*
        FROM Vehicles, Return, Rent
        WHERE vehicles.vid=Rent.vid AND Rent.rid=Return.rid AND Vehicles.location='${location}' AND Return.rid IN (
            SELECT Return.rid
            FROM Return
            WHERE fromDate>='${reportDate + ' 00:00:00'}' AND fromDate<='${reportDate + ' 23:59:59'}')
        ORDER BY vtname ASC;`
    return runQuery(query);
}

const runQuery = (query) => {
    return new Promise(function (resolve, reject) {
        pool.query(query, (error, results) => {
            if (error) {
                console.log("error :" + error + "with query: " + query);
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
    getVehicleFromReservation,
    rent,
    setVehicleStatusToRented,
    getInfoForReturn,
    returnVehicle,
    setVehicleStatusToAvailableAndUpdateOdometer,
    getDailyRentalsReport,
    getDailyRentalsReportForBranch,
    getDailyReturnsReport,
    getDailyReturnsReportForBranch,
    runQuery
};