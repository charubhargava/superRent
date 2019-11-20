var server_url = 'http://localhost:5000/'
var available_vehicle_types = ["Economy", "Compact", "Mid-size", "Standard", "Fullsize", "SUV", "Truck"];
var available_locations = ["Burnaby", "Richmond", "Surrey", "UBC", "Vancouver"];

window.onload = function() {
    console.log("window.onload");
    console.log(window.location.href);
    SERVER_URL = window.location.href;

    //TODO: get available locations and vehicle on load
    populateDropdown(document.getElementById("viewLocation"), available_locations);
    populateDropdown(document.getElementById("viewType"), available_vehicle_types);
    populateDropdown(document.getElementById("reserveLocation"), available_locations);
    populateDropdown(document.getElementById("reserveType"), available_vehicle_types);
}

function populateDropdown(dropdown, options) {
    console.log(options);
    for (var option of options) {
        console.log(option);
        var element = document.createElement("option");
        element.textContent = option;
        element.value = option;
        dropdown.appendChild(element);
    }
}

function viewVehicles() {
    console.log("viewVehicles");
    var elements = document.getElementById("viewForm");
    var type = elements.type.value;
    var location = elements.location.value;
    var startDate = elements.startDate.value;
    var startTime = elements.startTime.value;
    var endDate = elements.endDate.value;
    var endTime = elements.endTime.value;
    var requestUrl = server_url + `view/${type}/${location}/${startDate}/${startTime}/${endDate}/${endTime}`;
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
    var elements = document.getElementById("reserveForm");
    var type = elements.type.value;
    var location = elements.location.value;
    var startDate = elements.startDate.value;
    var startTime = elements.startTime.value;
    var endDate = elements.endDate.value;
    var endTime = elements.endTime.value;
    var cellphone = elements.cellphone.value;
    var name = elements.name.value;
    var address = elements.address.value;
    var dLicense = elements.dLicense.value;
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
    var elements = document.getElementById("cancelForm");
    var confNo = elements.confNo.value;
    var cellphone = elements.cellphone.value;
    var startDate = elements.startDate.value;
    var endDate = elements.endDate.value;
    var cellphone = elements.cellphone.value;
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
    var elements = document.getElementById("rentForm");
    var confNo = elements.confNo.value;
    var confCellphone = elements.confCellphone.value;
    var type = elements.type.value;
    var location = elements.location.value;
    var startDate = elements.startDate.value;
    var startTime = elements.startTime.value;
    var endDate = elements.endDate.value;
    var endTime = elements.endTime.value;
    var cellphone = elements.cellphone.value;
    var name = elements.name.value;
    var address = elements.address.value;
    var dLicense = elements.dLicense.value;
    var requestUrl = "";
    if (confNo) {
        requestUrl = server_url + `/prepareRent/confNo/${confNo}`
    } else if (confCellphone) {
        requestUrl = server_url + `/prepareRent/cellPhone/${confCellphone}`
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