const db = require("./db");
module.exports = {
    view: function(carType, location, startDate, startTime, endDate, endTime, cb) {
        console.log("view");
        console.log(arguments);
        var startTimestamp = getTimestamp(startDate, startTime);
        var endTimestamp = getTimestamp(endDate, endTime);
        db.viewVehiclesAvailable(carType, location, startTimestamp, endTimestamp)
        .then((result) => {
            console.log(result);
            cb(null, result);
        })
        .catch((err) => cb(err, null));
    },
    newCustomer: function(dlicense, name, address, cb) {
        console.log("newCustomer");
        console.log(arguments);
        var result = {};
        cb(null, result);
    },
    reserve: function(carType, location, startDate, startTime, endDate, endTime, dlicense, cb) {
        console.log("reserve");
        console.log(arguments);
        var startTimestamp = getTimestamp(startDate, startTime);
        var endTimestamp = getTimestamp(endDate, endTime);
        db.viewVehiclesAvailable(carType, location, startTimestamp, endTimestamp)
        .then((result) => {
            var availableVehicles = result.rows;
            if (availableVehicles.length > 0) {
                //TODO: Andrea do your thing
                db.createReservation()
                .then((result) => {
                    console.log(result);
                    cb(null, result);
                })
                .catch((err) => cb(err, null));
            }
            cb(null, result);
        })
        .catch((err) => cb(err, null));
    },
    prepareRent: function(confNo, cb) {
        var result = {};
        cb(null, result);
    },
    rent: function(confNo, dlicense, cardNo, expiration, cb) {
        //TODO: To complete the rent agreement, a customer has to provide their 
        //driver's license number and credit card information consisting of the card number 
        //and expiry date. 
        var result = {};
        cb(null, result);
    },
    return: function(confNo, date, time, odometer, fullTank, cb) {
        var result = {};
        cb(null, result);
    },
    getDailyRentalsReport: function(reportDate, cb) {
        //TODO:  This report contains information on all the vehicles rented out during the day. 
        //The entries are grouped by branch, and within each branch, the entries are grouped by 
        //vehicle category. The report also displays the number of vehicles rented per category 
        //(e.g., 5 sedan rentals, 2 SUV rentals, etc.), the number of rentals at each branch, and 
        //the total number of new rentals across the whole company
        var result = {};
        cb(null, result);
    },
    getDailyRentalsReportForBranch: function(reportDate, location, cb) {
        //TODO: This is the same as the Daily Rental report but it is for one specified branch
        var result = {};
        cb(null, result);
    },
    getDailyReturnsReport: function(reportDate, cb) {
        //TODO: The report contains information on all the vehicles returned during the day. 
        //The entries are grouped by branch, and within each branch, the entries are grouped 
        //by vehicle category. The report also shows the number of vehicles returned per category, 
        //the revenue per category, subtotals for the number of vehicles and revenue per branch, 
        //and the grand totals for the day. 
        var result = {};
        cb(null, result);
    },
    getDailyReturnsReportForBranch: function(reportDate, location, cb) {
        //TODO: This is the same as the Daily Returns report, but it is for one specified branch. 
        var result = {};
        cb(null, result);
    },
};

//Get timestap from date and time
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