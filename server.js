const { Pool } = require('pg');
const express = require('express')
const path = require('path')
const service = require('./service.js');
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public'), {
    index: false
  }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
    res.render('./pages/customer');
  })
  .get('/customer', (req, res) => {
    res.render('./pages/customer');
  })
  .get('/clerk', (req, res) => {
    res.render('./pages/clerk');
  })
  .get('/admin', (req, res) => {
    res.render('./pages/admin');
  })
  .get('/view', (req, res) => {
    var carType = req.query.type || null;
    var location = req.query.location || null;
    var startDate = req.query.startDate || null;
    var startTime= req.query.startTime || null;
    var endDate = req.query.endDate || null;
    var endTime = req.query.endTime || null;
    service.view(carType, location, startDate, startTime, endDate, endTime, (err, availableVehicles) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(availableVehicles);
    });
  })
  .post('/reserve/:type/:location/:startDate/:startTime/:endDate/:endTime/:dlicense', (req, res) => {
    var carType = sanatizeParam(req.params.type);
    var location = sanatizeParam(req.params.location);
    var startDate = sanatizeParam(req.params.startDate)
    var startTime= sanatizeParam(req.params.startTime);
    var endDate = sanatizeParam(req.params.endDate);
    var endTime = sanatizeParam(req.params.endTime);
    var dlicense = sanatizeParam(req.params.dlicense);
    service.reserve(carType, location, startDate, startTime, endDate, endTime, dlicense, (err, reservation) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(reservation);
    });
  })
  .post('/reserve/:type/:location/:startDate/:startTime/:endDate/:endTime/:dlicense/:name/:address', (req, res) => {
    var carType = sanatizeParam(req.params.type);
    var location = sanatizeParam(req.params.location);
    var startDate = sanatizeParam(req.params.startDate);
    var startTime= sanatizeParam(req.params.startTime);
    var endDate = sanatizeParam(req.params.endDate);
    var endTime = sanatizeParam(req.params.endTime);
    var name = sanatizeParam(req.params.name);
    var address = sanatizeParam(req.params.address);
    var dlicense = sanatizeParam(req.params.dlicense);
    service.newCustomer(dlicense, name, address, (err, newDlicense) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      service.reserve(carType, location, startDate, startTime, endDate, endTime, newDlicense, (err, reservation) => {
        if (err) {
          return res.status(400).send("Error: " + err + ` (Customer was successfully registered with driver license ${newDlicense})`);
        }
        return res.send(reservation);
      });
    });
  })
  .post('/prepareRent/:confNo', (req, res) => {
    var confNo = sanatizeParam(req.params.confNo);
    service.prepareRent(confNo, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .post('/prepareRent/:type/:location/:endDate/:endTime/:dlicense', (req, res) => {
    var carType = sanatizeParam(req.params.type);
    var location = sanatizeParam(req.params.location);
    var startDate = getCurrentDate();
    var startTime = getCurrentTime();
    var endDate = sanatizeParam(req.params.endDate);
    var endTime = sanatizeParam(req.params.endTime);
    var dlicense = sanatizeParam(req.params.dlicense);
    service.reserve(carType, location, startDate, startTime, endDate, endTime, dlicense, (err, reservation) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      var confNo = reservation.confNo;
      service.prepareRent(confNo, (err, result) => {
        if (err) {
          return res.status(400).send("Error: " + err);
        }
        return res.send(result);
      })
    });
  })
  .post('/prepareRent/:type/:location/:endDate/:endTime/:dlicense/:name/:address', (req, res) => {
    var carType = sanatizeParam(req.params.type);
    var location = sanatizeParam(req.params.location);
    var startDate = getCurrentDate();
    var startTime = getCurrentTime();
    var endDate = sanatizeParam(req.params.endDate);
    var endTime = sanatizeParam(req.params.endTime);
    var name = sanatizeParam(req.params.name);
    var address = sanatizeParam(req.params.address);
    var dlicense = sanatizeParam(req.params.dlicense);
    service.newCustomer(dlicense, name, address, (err, newDlicense) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      service.reserve(carType, location, startDate, startTime, endDate, endTime, newDlicense, (err, reservation) => {
        if (err) {
          return res.status(400).send("Error: " + err + ` (Customer was successfully registered with driver license ${newDlicense})`);
        }
        var confNo = reservation.confNo;
        service.prepareRent(confNo, (err, result) => {
          if (err) {
            return res.status(400).send("Error: " + err + ` (Customer was successfully registered with driver license ${newDlicense} and reservation confirmed with confNo: ${confNo})`);
          }
          return res.send(result);
        })
      });
    });
  })
  .post('/rent/:confNo/:dlicense/:cardNo/:expiration', (req, res) => {
    var confNo = sanatizeParam(req.params.confNo);
    var dlicense = sanatizeParam(req.params.dlicense);
    var cardNo = sanatizeParam(req.params.cardNo);
    var expiration = sanatizeParam(req.params.expiration);
    service.rent(confNo, dlicense, cardNo, expiration, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .post('/return/:confNo/:date/:time/:odometer/:fullTank', (req, res) => {
    var confNo = sanatizeParam(req.params.confNo);
    var date = sanatizeParam(req.params.date);
    var time = sanatizeParam(req.params.time);
    var odometer = sanatizeParam(req.params.odometer);
    var fullTank = sanatizeParam(req.params.fullTank);
    service.returnVehicle(confNo, date, time, odometer, fullTank, (err, returnSummary) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(returnSummary);
    })
  })
  .get('/getReport/dailyRentals/:reportDate', (req, res) => {
    var reportDate = sanatizeParam(req.params.reportDate);
    service.getDailyRentalsReport(reportDate, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .get('/getReport/dailyRentalsForBranch/:reportDate/:location', (req, res) => {
    var reportDate = sanatizeParam(req.params.reportDate);
    var location = sanatizeParam(req.params.location);
    service.getDailyRentalsReportForBranch(reportDate, location, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .get('/getReport/dailyReturns/:reportDate', (req, res) => {
    var reportDate = sanatizeParam(req.params.reportDate);
    service.getDailyReturnsReport(reportDate, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .get('/getReport/dailyReturnsForBranch/:reportDate/:location', (req, res) => {
    var reportDate = sanatizeParam(req.params.reportDate);
    var location = sanatizeParam(req.params.location);
    service.getDailyReturnsReport(reportDate, location, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .post('/databaseManipulation/:sqlQuery', (req, res) => {
    var sqlQuery = sanatizeParam(req.params.sqlQuery);
    service.databaseManipulation(sqlQuery, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

function sanatizeParam(param) {
  if (param == undefined ||
    param == null ||
    param == '' ||
    param == 'undefined' ||
    param == 'null') {
      return "";
  } else {
    return param
  }
}

function getCurrentDate() {
  now = new Date();
  var dd = now.getDate();
  var mm = now.getMonth()+1;
  var yyyy = now.getFullYear();
  
  if(dd<10) { dd='0'+dd; }
  if(mm<10) { mm='0'+mm; }
  return (yyyy+'-'+mm+'-'+dd);
};

function getCurrentTime() {
  now = new Date();
  var hh = now.getHours();
  var mm = now.getMinutes();
  
  if(hh<10) { hh='0'+hh; }
  if(mm<10) { mm='0'+mm; }
  return (hh+':'+mm);
};

