const DAILY_RENTALS = "Daily Rentals";
const DAILY_RETURNS = "Daily Returns"
const ANY = "Any";
const ALL = "All";

var server_url = 'http://localhost:5000/'
var available_vehicle_types = [ANY, "Economy", "Compact", "Mid-size", "Standard", "Fullsize", "SUV", "Truck"];
var available_locations = [ALL, "Burnaby", "Richmond", "Surrey", "UBC", "Vancouver"];
var available_report_types = [DAILY_RENTALS, DAILY_RETURNS];

window.onload = function() {
    console.log("window.onload");
    console.log(window.location.href);
    SERVER_URL = window.location.href;

    //TODO: get available locations and vehicle on load
    populateDropdown("location", available_locations);
    populateDropdown("type", available_vehicle_types);
    populateDropdown("reportType", available_report_types);
}

function populateDropdown(className, options) {
    dropdowns = document.getElementsByClassName(className);
    for (var dropdown of dropdowns) {
        for (var option of options) {
            var element = document.createElement("option");
            element.textContent = option;
            element.value = option;
            dropdown.appendChild(element);
        }
    }
}

function viewVehicles() {
    console.log("viewVehicles");
    var element = document.getElementById("viewForm");
    var type = element.type.value === ANY ? undefined : element.type.value;
    var location = element.location.value === ALL ? undefined : element.location.value;
    var startDate = element.startDate.value;
    var startTime = element.startTime.value;
    var endDate = element.endDate.value;
    var endTime = element.endTime.value;
    var requestUrl = server_url + `view?type=${type}&location=${location}&startDate=${startDate}&startTime=${startTime}&endDate=${endDate}&endTime=${endTime}`;
    console.log(requestUrl);
    httpGet(requestUrl,
    function(res) {
        console.log(res);
    },
    function(err) {
        alert(err);
    });
}

function reserveVehicles() {
    console.log("reserveVehicles");
    var element = document.getElementById("reserveForm");
    var type = element.type.value;
    var location = element.location.value;
    var startDate = element.startDate.value;
    var startTime = element.startTime.value;
    var endDate = element.endDate.value;
    var endTime = element.endTime.value;
    var cellphone = element.cellphone.value;
    var name = element.name.value;
    var address = element.address.value;
    var dLicense = element.dLicense.value;
    var requestUrl = "";
    if (!address || !dLicense) {
        requestUrl = server_url + `reserve/${type}/${location}/${startDate}/${startTime}/${endDate}/${endTime}/${cellphone}/${name}`;
    } else {
        requestUrl = server_url + `reserve/${type}/${location}/${startDate}/${startTime}/${endDate}/${endTime}/${cellphone}/${name}/${address}/${dLicense}`;
    }
    console.log(requestUrl);
    httpPost(requestUrl,
    function(res) {
        console.log(res);
    },
    function(err) {
        alert(err);
    });
}

function cancelReservation() {
    console.log("cancelReservation");
    var element = document.getElementById("cancelForm");
    var confNo = element.confNo.value;
    var cellphone = element.cellphone.value;
    var startDate = element.startDate.value;
    var endDate = element.endDate.value;
    var cellphone = element.cellphone.value;
    var requestUrl = "";
    if (confNo) {
        requestUrl = server_url + `cancel/${confNo}`;
    } else {
        requestUrl = server_url + `cancel/${cellphone}/${startDate}/${endDate}`;
    }
    console.log(requestUrl);
    httpPost(requestUrl,
    function(res) {
        console.log(res);
    },
    function(err) {
        alert(err);
    });
}

function prepareRentVehicle() {
    console.log("reserveVehicles");
    var element = document.getElementById("rentForm");
    var confNo = element.confNo.value;
    var confCellphone = element.confCellphone.value;
    var type = element.type.value;
    var location = element.location.value;
    var startDate = element.startDate.value;
    var startTime = element.startTime.value;
    var endDate = element.endDate.value;
    var endTime = element.endTime.value;
    var cellphone = element.cellphone.value;
    var name = element.name.value;
    var address = element.address.value;
    var dLicense = element.dLicense.value;
    var requestUrl = "";
    if (confNo) {
        requestUrl = server_url + `prepareRent/confNo/${confNo}`
    } else if (confCellphone) {
        requestUrl = server_url + `prepareRent/cellPhone/${confCellphone}`
    } else if (!address || !dLicense) {
        requestUrl = server_url + `prepareRent/${type}/${location}/${startDate}/${startTime}/${endDate}/${endTime}/${cellphone}/${name}`;
    } else {
        requestUrl = server_url + `prepareRent/${type}/${location}/${startDate}/${startTime}/${endDate}/${endTime}/${cellphone}/${name}/${address}/${dLicense}`;
    }
    console.log(requestUrl);
    httpPost(requestUrl,
    function(res) {
        console.log(res);
    },
    function(err) {
        alert(err);
    });
}

function returnVehicle() {
    console.log("returnVehicles");
    var element = document.getElementById("rentForm");
    var vLicense = element.vLicense.value;
    var returnDate = element.returnDate.value;
    var returnTime = element.returnTime.value;
    var odometer = element.odometer.value;
    var fulltank = element.fulltank.value;
    var requestUrl = server_url + `return/${vLicense}/${returnDate}/${returnTime}/${fulltank}`;
    console.log(requestUrl);
    httpPost(requestUrl,
    function(res) {
        console.log(res);
    },
    function(err) {
        alert(err);
    });
}

function getReport() {
    console.log("getReport");
    var element = document.getElementById("reportForm");
    var reportType = element.reportType.value;
    var location = element.location.value;
    var requestUrl = "";
    if (reportType === DAILY_RENTALS && location === ALL) {
        requestUrl = server_url + `getReport/dailyRentals`
    } else if (reportType === DAILY_RENTALS && location !== ALL) {
        requestUrl = server_url + `getReport/dailyRentalsForBranch/${location}`
    } else if (reportType === DAILY_RETURNS && location === ALL) {
        requestUrl = server_url + `getReport/dailyReturns`
    } else if (reportType === DAILY_RETURNS && location !== ALL) {
        requestUrl = server_url + `getReport/dailyReturnsForBranch/${location}`
    }
    console.log(requestUrl);
    httpGet(requestUrl,
    function(res) {
        console.log(res);
    },
    function(err) {
        alert(err);
    });
}

function httpGet(url, onSuccess, onError) {
    executeRequest("GET", url, onSuccess, onError);
}

function httpPost(url, onSuccess, onError) {
    executeRequest("POST", url, onSuccess, onError);
}

function executeRequest(requestType, url, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    xhr.open(requestType, url);
    xhr.onload = function() {
        if (xhr.status == 200) {
            onSuccess(JSON.parse(xhr.responseText));
        } else {
            onError(xhr.responseText);
        }
    }

    xhr.ontimeout = function() {
        onFailure("Request timed out");
    }
    xhr.onerror = function() {
        onFailure(xhr.responseText);
    }

    xhr.send();
}