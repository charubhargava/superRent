const DAILY_RENTALS = "Daily Rentals";
const DAILY_RETURNS = "Daily Returns"
const ALL = "All";

var server_url = 'http://localhost:5000/'
var available_vehicle_types = [ALL, "Economy", "Compact", "Mid-size", "Standard", "Fullsize", "SUV", "Truck"];
var available_locations = [ALL, "Burnaby", "Richmond", "Surrey", "UBC", "Vancouver"];
var available_report_types = [DAILY_RENTALS, DAILY_RETURNS];

window.onload = function () {
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
    var element = document.getElementById("viewForm");
    var type = element.type.value === ALL ? "" : element.type.value;
    var location = element.location.value === ALL ? "" : element.location.value;
    var startDate = element.startDate.value;
    var startTime = element.startTime.value;
    var endDate = element.endDate.value;
    var endTime = element.endTime.value;
    var requestUrl = server_url + `view?type=${type}&location=${location}&startDate=${startDate}&startTime=${startTime}&endDate=${endDate}&endTime=${endTime}`;
    httpGet(requestUrl,
        function (availableVehicles) {
            available_vehicles = availableVehicles;
            displayModal("view",
                function () {
                    var vehicleCount = {};
                    for (var location in availableVehicles) {
                        vehicleCount[location] = {};
                        for (var vehicleType in availableVehicles[location]) {
                            vehicleCount[location][vehicleType] =
                                `<a class=clickable onclick=(showVehicleDetails('${location}','${vehicleType}'))>${availableVehicles[location][vehicleType].length}</a>`;
                        }
                    }
                    var availableVehicleListContainer = document.getElementById("availableVehicleList");
                    availableVehicleListContainer.innerHTML = JSON.stringify(vehicleCount, null, 4);
                },
                function () { },
                function () { });
        },
        function (err) {
            alert(err);
        });
}

function showVehicleDetails(location, vehicleType) {
    displayModal("vehicleDetails",
        function () {
            var vehicleDetails = document.getElementById("vehicleDetails");
            vehicleDetails.innerHTML = JSON.stringify(available_vehicles[location][vehicleType], null, 4);
        },
        function () { },
        function () { });
}

function reserveVehicles() {
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
    httpPost(requestUrl,
        function (reservation) {
            displayModal("reserve",
                function () {
                    var reserveDetails = document.getElementById("reserveDetails");
                    reserveDetails.innerHTML = JSON.stringify(reservation, null, 4);
                },
                function () { },
                function () { });
        },
        function (err) {
            alert(err);
        });
}

function prepareRentVehicle() {
    var element = document.getElementById("rentForm");
    var confNo = element.confNo.value;
    var type = element.type.value;
    var location = element.location.value;
    var endDate = element.endDate.value;
    var endTime = element.endTime.value || '00:00';
    var name = element.name.value;
    var address = element.address.value;
    var dlicense = element.dlicense.value;
    var requestUrl = "";
    if (confNo) {
        requestUrl = server_url + `prepareRent/${confNo}`
    } else if (!address || !dlicense) {
        requestUrl = server_url + `prepareRent/${type}/${location}/${endDate}/${endTime}/${dlicense}`;
    } else {
        requestUrl = server_url + `prepareRent/${type}/${location}/${endDate}/${endTime}/${dlicense}/${name}/${address}`;
    }
    httpPost(requestUrl,
        function (selectedVehicle) {
            confirmRent(selectedVehicle);
        },
        function (err) {
            alert(err);
        });
}

function confirmRent(selectedVehicle) {
    displayModal("confirmRent",
        function () {
            var rentalInformation = document.getElementById("rentalInformation");
            rentalInformation.innerHTML = JSON.stringify(selectedVehicle, null, 4);
        },
        function () {
            var element = document.getElementById("confirmForm");
            var confNo = selectedVehicle.confNo;
            var dlicense = element.dlicense.value;
            var cardNo = element.cardNo.value;
            var expiration = element.expiration.value;
            var requestUrl = server_url + `rent/${confNo}/${dlicense}/${cardNo}/${expiration}`
            httpPost(requestUrl,
                function (rentSummary) {
                    displayModal("rent",
                        function () {
                            var rentDetails = document.getElementById("rentDetails");
                            rentDetails.innerHTML = JSON.stringify(rentSummary, null, 4);
                        },
                        function () { },
                        function () { });
                },
                function (err) {
                    alert(err);
                });
        },
        function () { });
}

function returnVehicle() {
    var element = document.getElementById("returnForm");
    var confNo = element.confNo.value;
    var returnDate = element.returnDate.value;
    var returnTime = element.returnTime.value;
    var odometer = element.odometer.value;
    var fulltank = element.fulltank.value;
    var requestUrl = server_url + `return/${confNo}/${returnDate}/${returnTime}/${odometer}/${fulltank}`;
    httpPost(requestUrl,
        function (returnSummary) {
            displayModal("return",
                function () {
                    var returnDetails = document.getElementById("returnDetails");
                    returnDetails.innerHTML = JSON.stringify(returnSummary, null, 4);
                },
                function () { },
                function () { });
        },
        function (err) {
            alert(err);
        });
}

var rented_vehicles = {};
var returned_vehicles = {};
function getReport() {
    var element = document.getElementById("reportForm");
    var reportType = element.reportType.value;
    var reportDate = element.reportDate.value;
    var location = element.location.value;
    var requestUrl = "";
    if (reportType === DAILY_RENTALS) {
        if (location === ALL) {
            requestUrl = server_url + `getReport/dailyRentals/${reportDate}`
        } else if (location !== ALL) {
            requestUrl = server_url + `getReport/dailyRentalsForBranch/${reportDate}/${location}`
        }
        httpGet(requestUrl,
            function (rentedVehicles) {
                rented_vehicles = rentedVehicles;
                displayModal("rentalReport",
                    function () {
                        var vehicleCount = {};
                        var totalCount = 0;
                        for (var location in rentedVehicles) {
                            vehicleCount[location] = {};
                            var totalCountPerLocation = 0;
                            for (var vehicleType in rentedVehicles[location]) {
                                totalCountPerLocation += rentedVehicles[location][vehicleType].length;
                                vehicleCount[location][vehicleType] =
                                    `<a class=clickable onclick=(showRentalReportDetails('${location}','${vehicleType}'))>${rentedVehicles[location][vehicleType].length}</a>`;
                            }
                            totalCount += totalCountPerLocation;
                            vehicleCount[location].totalFromBranch = totalCountPerLocation;
                        }
                        if (Object.keys(rentedVehicles).length > 1) { vehicleCount.totalFromAllBranches = totalCount; }
                        var rentalReportContent = document.getElementById("rentalReportContent");
                        rentalReportContent.innerHTML = JSON.stringify(vehicleCount, null, 4);
                    },
                    function () { },
                    function () { });
            },
            function (err) {
                alert(err);
            });
    } else if (reportType === DAILY_RETURNS) {
        if (location === ALL) {
            requestUrl = server_url + `getReport/dailyReturns/${reportDate}`
        } else if (location !== ALL) {
            requestUrl = server_url + `getReport/dailyReturnsForBranch/${reportDate}/${location}`
        }
        httpGet(requestUrl,
            function (returnedVehicles) {
                returned_vehicles = returnedVehicles;
                displayModal("returnReport",
                    function () {
                        var vehicleCount = {};
                        var totalRevenue = 0;
                        for (var location in returnedVehicles) {
                            vehicleCount[location] = {};
                            var branchRevenue = 0;
                            for (var vehicleType in returnedVehicles[location]) {
                                var typeRevenue = 0;
                                vehicleCount[location][vehicleType] = {};
                                vehicleCount[location][vehicleType].count =
                                    `<a class=clickable onclick=(showReturnReportDetails('${location}','${vehicleType}'))>${returnedVehicles[location][vehicleType].length}</a>`;
                                for (var vehicle of returnedVehicles[location][vehicleType]) {
                                    typeRevenue += vehicle.value;
                                }
                                vehicleCount[location][vehicleType].typeRevenue = typeRevenue;
                                branchRevenue += typeRevenue;
                            }
                            vehicleCount[location].branchRevenue = branchRevenue;
                            totalRevenue += branchRevenue;
                        }
                        vehicleCount.totalRevenue = totalRevenue;
                        var returnReportContent = document.getElementById("returnReportContent");
                        returnReportContent.innerHTML = JSON.stringify(vehicleCount, null, 4);
                    },
                    function () { },
                    function () { });
            },
            function (err) {
                alert(err);
            });
    }
}

function showRentalReportDetails(location, vehicleType) {
    displayModal("rentalReportDetails",
        function () {
            var rentalReportDetails = document.getElementById("rentalReportDetails");
            rentalReportDetails.innerHTML = JSON.stringify(rented_vehicles[location][vehicleType], null, 4);
        },
        function () { },
        function () { });
}

function showReturnReportDetails(location, vehicleType) {
    displayModal("returnReportDetails",
        function () {
            var returnReportDetails = document.getElementById("returnReportDetails");
            returnReportDetails.innerHTML = JSON.stringify(returned_vehicles[location][vehicleType], null, 4);
        },
        function () { },
        function () { });
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
    xhr.onload = function () {
        if (xhr.status == 200) {
            onSuccess(JSON.parse(xhr.responseText));
        } else {
            onError(xhr.responseText);
        }
    }

    xhr.ontimeout = function () {
        onFailure("Request timed out");
    }
    xhr.onerror = function () {
        onFailure(xhr.responseText);
    }

    xhr.send();
}

function displayModal(name, onDisplay, onButton, onClose) {
    var modal = document.getElementById(name + "Modal");
    var closeButton = document.getElementById(name + "Close");
    var button = document.getElementById(name + "Button");
    closeButton.onclick = function () {
        onClose();
        modal.style.display = "none";
    }
    button.onclick = function () {
        onButton();
        modal.style.display = "none";
    }
    onDisplay();
    modal.style.display = "block";
}