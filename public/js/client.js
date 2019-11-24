const DAILY_RENTALS = "Daily Rentals";
const DAILY_RETURNS = "Daily Returns"
const ALL = "All";

var server_url = 'http://localhost:5000/'
var available_vehicle_types = [ALL, "Economy", "Compact", "Mid-size", "Standard", "Fullsize", "SUV", "Truck"];
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

var available_vehicles = {};
function viewVehicles() {
    console.log("viewVehicles");
    var element = document.getElementById("viewForm");
    var type = element.type.value === ALL ? "" : element.type.value;
    var location = element.location.value === ALL ? "" : element.location.value;
    var startDate = element.startDate.value;
    var startTime = element.startTime.value;
    var endDate = element.endDate.value;
    var endTime = element.endTime.value;
    var requestUrl = server_url + `view?type=${type}&location=${location}&startDate=${startDate}&startTime=${startTime}&endDate=${endDate}&endTime=${endTime}`;
    console.log(requestUrl);
    httpGet(requestUrl,
    function(availableVehicles) {
        console.log(availableVehicles);
        available_vehicles = availableVehicles;
        displayModal("view",
        function() {
            var vehicleCount = {};
            for(var location in availableVehicles) {
                vehicleCount[location] = {};
                for(var vehicleType in availableVehicles[location]) {
                    vehicleCount[location][vehicleType] =
                    `<a class=clickable onclick=(showVehicleDetails('${location}','${vehicleType}'))>${availableVehicles[location][vehicleType].length}</a>`;
                }
            }
            var availableVehicleListContainer = document.getElementById("availableVehicleList");
            availableVehicleListContainer.innerHTML = JSON.stringify(vehicleCount, null, 4);
        },
        function() {},
        function() {});
    },
    function(err) {
        alert(err);
    });
}

function showVehicleDetails(location, vehicleType) {
    displayModal("vehicleDetails",
    function () {
        var vehicleDetails = document.getElementById("vehicleDetails");
        vehicleDetails.innerHTML =JSON.stringify(available_vehicles[location][vehicleType], null, 4);
    },
    function() {},
    function() {});
}

function reserveVehicles() {
    console.log("reserveVehicles");
    var element = document.getElementById("reserveForm");
    var type = element.type.value;
    var location = element.location.value;
    var startDate = element.startDate.value;
    var startTime = element.startTime.value || '00:00';
    var endDate = element.endDate.value;
    var endTime = element.endTime.value || '00:00';
    var name = element.name.value;
    var address = element.address.value;
    var dlicense = element.dlicense.value;
    var requestUrl = "";
    if (!address || !dlicense) {
        requestUrl = server_url + `reserve/${type}/${location}/${startDate}/${startTime}/${endDate}/${endTime}/${dlicense}`;
    } else {
        requestUrl = server_url + `reserve/${type}/${location}/${startDate}/${startTime}/${endDate}/${endTime}/${dlicense}/${name}/${address}`;
    }
    console.log(requestUrl);
    httpPost(requestUrl,
    function(reservation) {
        displayModal("reserve",
        function () {
            var reserveDetails = document.getElementById("reserveDetails");
            reserveDetails.innerHTML =JSON.stringify(reservation, null, 4);
        },
        function() {},
        function() {});
    },
    function(err) {
        alert(err);
    });
}

function prepareRentVehicle() {
    console.log("prepareRentVehicle");
    var element = document.getElementById("rentForm");
    var confNo = element.confNo.value;
    var type = element.type.value;
    var location = element.location.value;
    var startDate = element.startDate.value;
    var startTime = element.startTime.value || '00:00';
    var endDate = element.endDate.value;
    var endTime = element.endTime.value || '00:00';
    var name = element.name.value;
    var address = element.address.value;
    var dlicense = element.dlicense.value;
    var requestUrl = "";
    if (confNo) {
        requestUrl = server_url + `prepareRent/${confNo}`
    } else if (!address || !dlicense) {
        requestUrl = server_url + `prepareRent/${type}/${location}/${startDate}/${startTime}/${endDate}/${endTime}/${dlicense}`;
    } else {
        requestUrl = server_url + `prepareRent/${type}/${location}/${startDate}/${startTime}/${endDate}/${endTime}/${dlicense}/${name}/${address}`;
    }
    console.log(requestUrl);
    httpPost(requestUrl,
    function(res) {
        console.log(res);
        confNo = res.rows[0].confno;
        confirmRent(confNo);
    },
    function(err) {
        alert(err);
    });
}

function confirmRent(confNo) {
    console.log(confNo);
    displayModal("confirmRent", 
    function() {},
    function() {
        console.log("confirmRent");
        var element = document.getElementById("confirmForm");
        var dlicense = element.dlicense.value;
        var cardNo = element.cardNo.value;
        var expiration = element.expiration.value;
        var requestUrl = server_url + `rent/${confNo}/${dlicense}/${cardNo}/${expiration}`
        console.log(requestUrl);
        httpPost(requestUrl,
        function(res) {
            console.log(res);
        },
        function(err) {
            alert(err);
        });
    },
    function() {});
}

function returnVehicle() {
    console.log("returnVehicles");
    var element = document.getElementById("returnForm");
    var confNo = element.confNo.value;
    var returnDate = element.returnDate.value;
    var returnTime = element.returnTime.value;
    var odometer = element.odometer.value;
    var fulltank = element.fulltank.value;
    var requestUrl = server_url + `return/${confNo}/${returnDate}/${returnTime}/${odometer}/${fulltank}`;
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
    var reportDate = element.reportDate.value;
    var location = element.location.value;
    var requestUrl = "";
    if (reportType === DAILY_RENTALS && location === ALL) {
        requestUrl = server_url + `getReport/dailyRentals/${reportDate}`
    } else if (reportType === DAILY_RENTALS && location !== ALL) {
        requestUrl = server_url + `getReport/dailyRentalsForBranch/${reportDate}/${location}`
    } else if (reportType === DAILY_RETURNS && location === ALL) {
        requestUrl = server_url + `getReport/dailyReturns/${reportDate}`
    } else if (reportType === DAILY_RETURNS && location !== ALL) {
        requestUrl = server_url + `getReport/dailyReturnsForBranch/${reportDate}/${location}`
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

function displayModal(name, onDisplay, onButton, onClose) {
    var modal = document.getElementById(name + "Modal");
    var closeButton = document.getElementById(name + "Close");
    var button = document.getElementById(name +  "Button");
    closeButton.onclick = function() {
        onClose();
        modal.style.display = "none";
    }
    button.onclick = function() {
        onButton();
        modal.style.display = "none";
    }
    onDisplay();
    modal.style.display = "block";
}