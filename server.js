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
    res.render('./pages/clerk');
  })
  .get('/view', (req, res) => {
    var carType = req.query.type || null;
    var location = req.query.location || null;
    var startDate = req.query.startDate || null;
    var startTime= req.query.startTime || null;
    var endDate = req.query.endDate || null;
    var endTime = req.query.endTime || null;
    service.view(carType, location, startDate, startTime, endDate, endTime, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(result);
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
    service.reserve(carType, location, startDate, startTime, endDate, endTime, dlicense, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(result);
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
    service.newCustomer(dlicense, name, address, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      var dlicense = result.rows[0].dlicense;
      service.reserve(carType, location, startDate, startTime, endDate, endTime, dlicense, (err, result) => {
        if (err) {
          return res.status(400).send("Error: " + err);
        }
        return res.send(result);
      });
    });
  })
  .post('/prepareRent/:confNo', (req, res) => {
    console.log("prepareRent using confNo");
    var confNo = sanatizeParam(req.params.confNo);
    service.prepareRent(confNo, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .post('/prepareRent/:type/:location/:startDate/:startTime/:endDate/:endTime/:dlicense', (req, res) => {
    var carType = sanatizeParam(req.params.type);
    var location = sanatizeParam(req.params.location);
    var startDate = sanatizeParam(req.params.startDate);
    var startTime= sanatizeParam(req.params.startTime);
    var endDate = sanatizeParam(req.params.endDate);
    var endTime = sanatizeParam(req.params.endTime);
    var dlicense = sanatizeParam(req.params.dlicense);
    service.reserve(carType, location, startDate, startTime, endDate, endTime, dlicense, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      var confNo = result.rows[0].confno;
      service.prepareRent(confNo, (err, result) => {
        if (err) {
          return res.status(400).send("Error: " + err);
        }
        return res.send(result);
      })
    });
  })
  .post('/prepareRent/:type/:location/:startDate/:startTime/:endDate/:endTime/:dlicense/:name/:address', (req, res) => {
    var carType = sanatizeParam(req.params.type);
    var location = sanatizeParam(req.params.location);
    var startDate = sanatizeParam(req.params.startDate);
    var startTime= sanatizeParam(req.params.startTime);
    var endDate = sanatizeParam(req.params.endDate);
    var endTime = sanatizeParam(req.params.endTime);
    var name = sanatizeParam(req.params.name);
    var address = sanatizeParam(req.params.address);
    var dlicense = sanatizeParam(req.params.dlicense);
    service.newCustomer(dlicense, name, address, (err, result) => {
      if (err) {
        return res.status(400).send("Error: " + err);
      }
      var dlicense = result.rows[0].dlicense;
      service.reserve(carType, location, startDate, startTime, endDate, endTime, dlicense, (err, result) => {
        if (err) {
          return res.status(400).send("Error: " + err);
        }
        console.log(result);
        var confNo = result.rows[0].confno;
        service.prepareRent(confNo, (err, result) => {
          if (err) {
            return res.status(400).send("Error: " + err);
          }
          return res.send(result);
        })
      });
    });
  })
  .post('/rent/:confNo/:dlicense/:cardNo/:expiration', (req, res) => {
    console.log("rent");
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
    service.returnVehicle(confNo, date, time, odometer, fullTank, (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .get('/getReport/dailyRentals/:reportDate', (req, res) => {
    var reportDate = sanatizeParam(req.params.reportDate);
    service.getDailyRentalsReport(reportDate, (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .get('/getReport/dailyRentalsForBranch/:reportDate/:location', (req, res) => {
    var reportDate = sanatizeParam(req.params.reportDate);
    var location = sanatizeParam(req.params.location);
    service.getDailyRentalsReportForBranch(reportDate, location, (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .get('/getReport/dailyReturns/:reportDate', (req, res) => {
    var reportDate = sanatizeParam(req.params.reportDate);
    service.getDailyReturnsReport(reportDate, (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Error: " + err);
      }
      return res.send(result);
    })
  })
  .get('/getReport/dailyReturnsForBranch/:reportDate/:location', (req, res) => {
    var reportDate = sanatizeParam(req.params.reportDate);
    var location = sanatizeParam(req.params.location);
    service.getDailyReturnsReport(reportDate, location, (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Error: " + err);
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
