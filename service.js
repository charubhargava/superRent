const db = require("./db");
const ERROR = require("./error");

module.exports = {
    view: function(carType, location, startDate, startTime, endDate, endTime, cb) {
        var startTimestamp = getTimestamp(startDate, startTime);
        var endTimestamp = getTimestamp(endDate, endTime);
        if (Date.parse(startTimestamp) < new Date()) {
            return cb(ERROR.EARLY_TIME, null);
        }
        if (Date.parse(startTimestamp) > Date.parse(endTimestamp)) {
            return cb(ERROR.END_AFTER_START, null);
        }
        db.viewVehiclesAvailable(carType, location, startTimestamp, endTimestamp)
        .then((result) => {
            let availableVehicles = result.rows;
            if (availableVehicles.length < 1) {
                return cb(ERROR.VEHICLES_UNAVAILABLE, null);
            }
            return cb(null, organizeVehiclesByBranchAndTypes(availableVehicles));
        })
        .catch((err) => cb(err, null));
    },
    newCustomer: function(dlicense, name, address, cb) {
        db.newCustomer(dlicense, name, address)
        .then((result) => {
            let newCustomerDlicense = result.rows[0].dlicense;
            return cb(null, newCustomerDlicense);
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
        if (!location) {
            return cb(ERROR.NO_LOCATION, null);
        }
        if (!carType) {
            return cb(ERROR.NO_CARTYPE, null);
        }
        db.viewVehiclesAvailable(carType, location, startTimestamp, endTimestamp)
        .then((result) => {
            var availableVehicles = result.rows;
            if (availableVehicles.length > 0) {
                db.createReservation(carType, availableVehicles[0].vid, startTimestamp, endTimestamp, dlicense)
                .then((result) => {
                    if (result.rows.length < 1) {
                        return cb(ERROR.CUSTOMER_NOT_EXISTS, null);
                    } else {
                        let reservation = result.rows[0];
                        reservation.confNo = reservation.confno;
                        delete reservation.confno;
                        delete reservation.vid;
                        return cb(null, reservation);
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
        db.getVehicleFromReservation(confNo)
        .then((result) => {
            let availableVehicles = result.rows;
            if (availableVehicles.length < 1) {
                return cb(ERROR.VEHICLES_UNAVAILABLE, null);
            } else {
                let selectedVehicle = availableVehicles[0];
                selectedVehicle.confNo = selectedVehicle.confno;
                delete selectedVehicle.confno;
                delete selectedVehicle.vid;
                return cb(null, selectedVehicle);
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
            let rentReceipts = result.rows;
            if (rentReceipts.length < 1) {
                return cb(ERROR.DRIVER_LICENSE_NOT_MATCH, null);
            }
            var rentReceipt = rentReceipts[0];
            db.setVehicleStatusToRented(rentReceipt.vid).then((ignore) => {
                delete rentReceipt.expdate;
                delete rentReceipt.cardno;
                delete cardName;
                return cb(null, rentReceipt);
            })
            .catch((err) => cb(err, null));
        })
        .catch((err) => cb(err, null));
    },
    returnVehicle: function(confNo, date, time, odometer, fullTank, cb) {
        var returnTime = getTimestamp(date, time);
        db.getInfoForReturn(confNo)
        .then((result) => {
            if (result.rows.length < 1) {
                return cb(ERROR.UNABLE_TO_RETURN, null);
            }
            var vehicleInfo = result.rows[0];
            var miliseconds = new Date(returnTime) - new Date(vehicleInfo.fromdate);
            var weeks = Math.floor(miliseconds/1000/60/60/24/7);
            var days = Math.floor(miliseconds/1000/60/60/24)-weeks*7;
            var hours = Math.floor(miliseconds/1000/60/60)-days*24-weeks*24*7;
            var returnSummary = {
                confNo: vehicleInfo.confno,
                returnTime: returnTime,
                weeklyRate: vehicleInfo.wrate,
                dailyRate: vehicleInfo.drate,
                hourlyRate: vehicleInfo.hrate,
                weeklyInsuranceRate: vehicleInfo.wirate,
                dailyInsuranceRate: vehicleInfo.dirate,
                hourlyInsuraceRate: vehicleInfo.hirate,
                weeks: weeks,
                days: days,
                hours: hours,
                total: weeks*(vehicleInfo.wrate + vehicleInfo.wirate)
                    + days*(vehicleInfo.drate + vehicleInfo.dirate)
                    + hours*(vehicleInfo.hrate + vehicleInfo.hirate),
            }
            db.returnVehicle(confNo, returnTime, odometer, fullTank, returnSummary.total)
            .then((result) => {
                if(result.rows[0].length < 1) {
                    db.setVehicleStatusToAvailableAndUpdateOdometer(vehicleInfo.vid, odometer);
                    return cb(ERROR.UNABLE_TO_RETURN, null);
                }
                return cb(null, returnSummary);
            })
            .catch((err) => cb(err, null));
        })
        .catch((err) => cb(err, null));
    },
    getDailyRentalsReport: function(reportDate, cb) {
        //TODO:  This report contains information on all the vehicles rented out during the day. 
        //The entries are grouped by branch, and within each branch, the entries are grouped by 
        //vehicle category. The report also displays the number of vehicles rented per category 
        //(e.g., 5 sedan rentals, 2 SUV rentals, etc.), the number of rentals at each branch, and 
        //the total number of new rentals across the whole company
        db.getDailyRentalsReport(reportDate)
        .then((result) => {
            let vehicles = result.rows;
            if (vehicles.length < 1) {
                return cb(ERROR.VEHICLES_UNAVAILABLE, null);
            }
            return cb(null, organizeVehiclesByBranchAndTypes(vehicles));
        })
        .catch((err) => cb(err, null));
    },
    getDailyRentalsReportForBranch: function(reportDate, location, cb) {
        //TODO: This is the same as the Daily Rental report but it is for one specified branch
        db.getDailyRentalsReportForBranch(reportDate, location)
        .then((result) => {
            let vehicles = result.rows;
            if (vehicles.length < 1) {
                return cb(ERROR.VEHICLES_UNAVAILABLE, null);
            }
            return cb(null, organizeVehiclesByBranchAndTypes(vehicles));
        })
        .catch((err) => cb(err, null));
    },
    getDailyReturnsReport: function(reportDate, cb) {
        //TODO: The report contains information on all the vehicles returned during the day. 
        //The entries are grouped by branch, and within each branch, the entries are grouped 
        //by vehicle category. The report also shows the number of vehicles returned per category, 
        //the revenue per category, subtotals for the number of vehicles and revenue per branch, 
        //and the grand totals for the day. 
        db.getDailyReturnsReport(reportDate)
        .then((result) => {
            let vehicles = result.rows;
            if (vehicles.length < 1) {
                return cb(ERROR.VEHICLES_UNAVAILABLE, null);
            }
            return cb(null, organizeVehiclesByBranchAndTypes(vehicles));
        })
        .catch((err) => cb(err, null));
    },
    getDailyReturnsReportForBranch: function(reportDate, location, cb) {
        //TODO: This is the same as the Daily Returns report, but it is for one specified branch. 
        db.getDailyReturnsReportForBranch(reportDate, location)
        .then((result) => {
            let vehicles = result.rows;
            if (vehicles.length < 1) {
                return cb(ERROR.VEHICLES_UNAVAILABLE, null);
            }
            return cb(null, organizeVehiclesByBranchAndTypes(vehicles));
        })
        .catch((err) => cb(err, null));
    },
    databaseManipulation: function(sqlQuery, cb) {
        db.runQuery(sqlQuery)
        .then((result) => {
            return cb(null, result);
        })
        .catch((err) => cb(err, null));
    }
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

function organizeVehiclesByBranchAndTypes(vehicles) {
    var vehicleByLocation = {};
    for(var vehicle of vehicles) {
        if (!vehicleByLocation[vehicle.location]) {
            vehicleByLocation[vehicle.location] = [];
        }
        vehicleByLocation[vehicle.location].push(vehicle);
    }

    var vehicleByTypePerLocation = {};
    for(var location in vehicleByLocation) {
        vehicleByTypePerLocation[location] = {};
        for(var vehicle of vehicleByLocation[location]) {
            if (!vehicleByTypePerLocation[location][vehicle.vtname]) {
                vehicleByTypePerLocation[vehicle.location][vehicle.vtname] = [];
            }
            vehicleByTypePerLocation[vehicle.location][vehicle.vtname].push(vehicle);
        }
    }
    return vehicleByTypePerLocation;
}