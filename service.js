const db = require("./db");
const ERROR = require("./error");

module.exports = {
    view: function(carType, location, startDate, startTime, endDate, endTime, cb) {
        var startTimestamp = getTimestamp(startDate, startTime);
        var endTimestamp = getTimestamp(endDate, endTime);
        db.viewVehiclesAvailable(carType, location, startTimestamp, endTimestamp)
        .then((result) => {
            let availableVehicles = result.rows;
            if (availableVehicles.length < 1) {
                return cb(ERROR.VEHICLES_UNAVAILABLE, null);
            } else {
                return cb(null, result);
            }
        })
        .catch((err) => cb(err, null));
    },
    newCustomer: function(dlicense, name, address, cb) {
        db.newCustomer(dlicense, name, address)
        .then((result) => {
            return cb(null, result);
        })
        .catch((err) => {
            if (err.includes('duplicate key')) {
                err = ERROR.CUSTOMER_ALREADY_EXISTS;
            }
            return cb(err, null);
        });

    },
    reserve: function(carType, location, startDate, startTime, endDate, endTime, dlicense, cb) {
        var startTimestamp = getTimestamp(startDate, startTime);
        var endTimestamp = getTimestamp(endDate, endTime);
        db.viewVehiclesAvailable(carType, location, startTimestamp, endTimestamp)
        .then((result) => {
            var availableVehicles = result.rows;
            if (availableVehicles.length > 0) {
                db.createReservation(carType, availableVehicles[0].vid, startDate, endDate, dlicense)
                .then((result) => {
                    if (result.rows.length < 1) {
                        return cb(ERROR.CUSTOMER_NOT_EXISTS, null);
                    } else {
                        return cb(null, result);
                    }
                })
                .catch((err) => cb(err, null));
            } else {
                return cb(ERROR.VEHICLES_UNAVAILABLE, null);
            }
        })
        .catch((err) => cb(err, null));
    },
    prepareRent: function(confNo, cb) {
        db.getVehicles(confNo)
        .then((result) => {
            let availableVehicles = result.rows;
            if (availableVehicles.length < 1) {
                return cb(ERROR.VEHICLES_UNAVAILABLE, null);
            } else {
                return cb(null, result);
            }
        })
        .catch((err) => cb(err, null));
    },
    rent: function(confNo, dlicense, cardNo, expiration, cb) {
        //TODO: To complete the rent agreement, a customer has to provide their 
        //driver's license number and credit card information consisting of the card number 
        //and expiry date.
        db.rent(confNo, dlicense, '', cardNo, expiration + '-01')
        .then((result) => {
            let vehicles = result.rows;
            if (vehicles.length < 1) {
                return cb(ERROR.DRIVER_LICENSE_NOT_MATCH, null);
            }
            db.setVehicleStatusToRented(vehicles[0].vid).then((ignore) => {
                return cb(null, result);
            })
            .catch((err) => cb(err, null));
        })
        .catch((err) => cb(err, null));
    },
    returnVehicle: function(confNo, date, time, odometer, fullTank, cb) {
        var returnTime = getTimestamp(date, time);
        db.returnVehicle(confNo, returnTime, odometer, fullTank, 0)
        .then((result) => {
            return cb(null, result);
        })
        .catch((err) => cb(err, null));
    },
    getDailyRentalsReport: function(reportDate, cb) {
        //TODO:  This report contains information on all the vehicles rented out during the day. 
        //The entries are grouped by branch, and within each branch, the entries are grouped by 
        //vehicle category. The report also displays the number of vehicles rented per category 
        //(e.g., 5 sedan rentals, 2 SUV rentals, etc.), the number of rentals at each branch, and 
        //the total number of new rentals across the whole company
        var result = {};
        return cb(null, result);
    },
    getDailyRentalsReportForBranch: function(reportDate, location, cb) {
        //TODO: This is the same as the Daily Rental report but it is for one specified branch
        var result = {};
        return cb(null, result);
    },
    getDailyReturnsReport: function(reportDate, cb) {
        //TODO: The report contains information on all the vehicles returned during the day. 
        //The entries are grouped by branch, and within each branch, the entries are grouped 
        //by vehicle category. The report also shows the number of vehicles returned per category, 
        //the revenue per category, subtotals for the number of vehicles and revenue per branch, 
        //and the grand totals for the day. 
        var result = {};
        return cb(null, result);
    },
    getDailyReturnsReportForBranch: function(reportDate, location, cb) {
        //TODO: This is the same as the Daily Returns report, but it is for one specified branch. 
        var result = {};
        return cb(null, result);
    },
};

//Get timestamp from date and time
//eg. 2016-06-22 19:10:25
function getTimestamp(date, time) {
    if (!date) {
        return "";
    }
    if (!time) {
        time = "00:00";
    }
    return date + ' ' + time + ':00';
}