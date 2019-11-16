module.exports = {
    view: function(carType, location, startTime, endTime, cb) {
        //TODO: View the number of available vehicles for a specific car type, location, and time interval. 
        //The user should be able to provide any subset of {car type, location, time interval} to view 
        //the available vehicles. If the user provides no information, your application should automatically 
        //return a list of all vehicles (at that branch) sorted in some reasonable way for the user 
        //to peruse. The actual number of available vehicles should be displayed. After seeing 
        //the number of vehicles, there should be a way for the user to see the details of the 
        //available vehicles if the user desires to do so (e.g., if the user clicks on the number of 
        //available vehicles, a list with the vehicles’ details should be displayed). 
        var result = {};
        cb(null, result);
    },
    newCustomer: function(cellphone, name, address, dLicense, cb) {
        //TODO: When a customer first rents a vehicle, the company records the customer name, address, 
        //and cell phone number (with the area code). A customer is usually identified by their 
        //phone number. 
        var result = {};
        cb(null, result);
    },
    reserve: function(carType, location, startTime, endTime, cellphone, name, cb) {
        //TODO:  make a reservation, a customer provides the location, the type of the vehicle, 
        //and the day and time for which she/he would like to pick up and return the vehicle. 
        //The customer can then proceed and make a reservation or cancel it.  To make a reservation, 
        //the customer provides her/his name and phone number, and the system prints a confirmation number. 
        var result = {};
        cb(null, result);
    },
    cancelReservationUsingConfNo: function(confNo, cb) {
        //TODO: To cancel a reservation, a customer must provide either the confirmation number 
        //or their phone number and the dates.  
        var result = {};
        cb(null, result);
    },
    cancelReservationUsingCellphone: function(cellphone, startDate, endDate, cb) {
        //TODO: To cancel a reservation, a customer must provide either the confirmation number 
        //or their phone number and the dates.  
        var result = {};
        cb(null, result);
    },
    prepareRent: function(confNo, cb) {
        //TODO: To rent a vehicle, a customer provides the same information as that required 
        //for a reservation. If a customer has already made a reservation, she/he needs only to 
        //provide the confirmation number or their phone number. The system gets the rest of 
        //the information from the reservation record. 
        var result = {};
        cb(null, result);
    },
    getConfNoFromCellphone: function(cellphone, cb) {
        //TODO get confirmation number from customer's cellphone number
        var result = {};
        cb(null, result);
    },
    rent: function(confNo, dLicense, cardNo, expiration, cb) {
        //TODO: To complete the rent agreement, a customer has to provide their 
        //driver's license number and credit card information consisting of the card number 
        //and expiry date. 
        var result = {};
        cb(null, result);
    },
    return: function(rentId, date, time, odometer, fullTank, value, cb) {
        //TODO: Only a rented vehicle can be returned. Trying to return a vehicle that has not been 
        //rented should generate some type of error message for the clerk
        //When a customer returns a vehicle, the clerk enters the date, the time, the odometer reading, 
        //and whether the gas tank is full. The system calculates the charges by applying the weekly rate 
        //to whole weeks, daily rate to remaining days, and hourly rate to additional hours. 
        //It calculates the insurance cost in a similar manner by taking into account the insurance rates
        //for the vehicle.
        var result = {};
        cb(null, result);
    },
    getDailyRentalsReport: function(cb) {
        //TODO:  This report contains information on all the vehicles rented out during the day. 
        //The entries are grouped by branch, and within each branch, the entries are grouped by 
        //vehicle category. The report also displays the number of vehicles rented per category 
        //(e.g., 5 sedan rentals, 2 SUV rentals, etc.), the number of rentals at each branch, and 
        //the total number of new rentals across the whole company
        var result = {};
        cb(null, result);
    },
    getDailyRentalsReportForBranch: function(location, cb) {
        //TODO: This is the same as the Daily Rental report but it is for one specified branch
        var result = {};
        cb(null, result);
    },
    getDailyReturnsReport: function(cb) {
        //TODO: The report contains information on all the vehicles returned during the day. 
        //The entries are grouped by branch, and within each branch, the entries are grouped 
        //by vehicle category. The report also shows the number of vehicles returned per category, 
        //the revenue per category, subtotals for the number of vehicles and revenue per branch, 
        //and the grand totals for the day. 
        var result = {};
        cb(null, result);
    },
    getDailyReturnsReportForBranch: function(location, cb) {
        //TODO: This is the same as the Daily Returns report, but it is for one specified branch. 
        var result = {};
        cb(null, result);
    },
};