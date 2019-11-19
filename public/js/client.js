var server_url = 'http://localhost:5000/'
var available_vehicle_types = ["Economy", "Compact", "Mid-size", "Standard", "Fullsize", "SUV", "Truck"];
var available_locations = ["Burnaby", "Richmond", "Surrey", "UBC", "Vancouver"];

window.onload = function() {
    console.log(window.location.href)
    SERVER_URL = window.location.href;

    //TODO: get available locations and vehicle on load
    populateDropdown(document.getElementById("viewLocation"), available_locations);
    populateDropdown(document.getElementById("viewType"), available_vehicle_types);
}

function populateDropdown(dropdown, options) {
    for(option of options) {
        var element = document.createElement("option");
        element.textContent = option;
        element.value = opt;
        dropdown.appendChild(element);
    }​
}

function viewVehicles() {
    console.log("viewVehicles");
    var elements = document.getElementById("viewVehiclesForm");
    var type = elements.type.value;
    var location = elements.location.value;
    var start = elements.start.value;
    var end = elements.end.value;
    console.log(type);
    console.log(location);
    httpGet(server_url + `view/${type}/${location}/${start}/${end}`,
    function(res) {
        console.log(res);
    },
    function(err) {
        alert(err);
    });
}

function httpGet(url, onSuccess, onError) {
    var executeXhr = executeRequest("GET", url, onSuccess, onError);
    executeXhr();
}

function httpPost(url, onSuccess, onError) {
    var executeXhr = executeRequest("POST", url, onSuccess, onError);
    executeXhr();
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