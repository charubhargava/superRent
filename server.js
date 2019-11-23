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
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    });
  })
  .post('/reserve/:type/:location/:startDate/:startTime/:endDate/:endTime/:dlicense', (req, res) => {
    var carType = req.params.type || null;
    var location = req.params.location || null;
    var startDate = req.params.startDate || null;
    var startTime= req.params.startTime || null;
    var endDate = req.params.endDate || null;
    var endTime = req.params.endTime || null;
    var dlicense = req.params.dlicense || null;
    service.reserve(carType, location, startDate, startTime, endDate, endTime, dlicense, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    });
  })
  .post('/reserve/:type/:location/:startDate/:startTime/:endDate/:endTime/:dlicense/:name/:address', (req, res) => {
    var carType = req.params.type || null;
    var location = req.params.location || null;
    var startDate = req.params.startDate || null;
    var startTime= req.params.startTime || null;
    var endDate = req.params.endDate || null;
    var endTime = req.params.endTime || null;
    var name = req.params.name || null;
    var address = req.params.address || null;
    var dlicense = req.params.dlicense || null;
    service.newCustomer(dlicense, name, address, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      var dlicense = result.dlicense;
      service.reserve(carType, location, startDate, startTime, endDate, endTime, dlicense, (err, result) => {
        if (err) {
          console.error(err);
          res.send("Error " + err);
        }
        res.send(result);
      });
    });
  })
  .post('/prepareRent/:confNo', (req, res) => {
    console.log("prepareRent using confNo");
    var confNo = req.params.confNo || null;
    service.prepareRent(confNo, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    })
  })
  .post('/prepareRent/:type/:location/:startDate/:startTime/:endDate/:endTime/:dlicense', (req, res) => {
    var carType = req.params.type || null;
    var location = req.params.location || null;
    var startDate = req.params.startDate || null;
    var startTime= req.params.startTime || null;
    var endDate = req.params.endDate || null;
    var endTime = req.params.endTime || null;
    var dlicense = req.params.dlicense || null;
    service.reserve(carType, location, startDate, startTime, endDate, endTime, dlicense, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      service.prepareRent(confNo, (err, result) => {
        if (err) {
          console.error(err);
          res.send("Error " + err);
        }
        res.send(result);
      })
    });
  })
  .post('/prepareRent/:type/:location/:startDate/:startTime/:endDate/:endTime/:cellphone/:name/:address/:dlicense', (req, res) => {
    var carType = req.params.type || null;
    var location = req.params.location || null;
    var startDate = req.params.startDate || null;
    var startTime= req.params.startTime || null;
    var endDate = req.params.endDate || null;
    var endTime = req.params.endTime || null;
    var cellphone = req.params.cellphone || null;
    var name = req.params.name || null;
    var address = req.params.address || null;
    var dlicense = req.params.dlicense || null;
    service.newCustomer(name, address, dlicense, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      var dlicense = result.dlicense;
      service.reserve(carType, location, startDate, startTime, endDate, endTime, dlicense, (err, result) => {
        if (err) {
          console.error(err);
          res.send("Error " + err);
        }
        var confNo = result.confNo;
        service.prepareRent(confNo, (err, result) => {
          if (err) {
            console.error(err);
            res.send("Error " + err);
          }
          res.send(result);
        })
      });
    });
  })
  .post('/rent/:confNo/:dlicense/:cardNo/:expiration', (req, res) => {
    console.log("rent");
    var confNo = req.params.confNo || null;
    var dlicense = req.params.dlicense || null;
    var cardNo = req.params.cardNo || null;
    var expiration = req.params.expiratio || null;
    service.rent(confNo, dlicense, cardNo, expiration, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    })
  })
  .post('/return/:confNo/:date/:time/:odometer/:fullTank', (req, res) => {
    var confNo = req.params.confNo || null;
    var date = req.params.date || null;
    var time = req.params.time || null;
    var odometer = req.params.odometer || null;
    var fullTank = req.params.fullTank || null
    service.return(confNo, date, time, odometer, fullTank, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    })
  })
  .get('/getReport/dailyRentals', (req, res) => {
    service.getDailyRentalsReport((err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    })
  })
  .get('/getReport/dailyRentalsForBranch/:location', (req, res) => {
    var location = req.params.location || null;
    service.getDailyRentalsReportForBranch(location, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    })
  })
  .get('/getReport/dailyReturns', (req, res) => {
    service.getDailyReturnsReport((err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    })
  })
  .get('/getReport/dailyReturnsForBranch/:location', (req, res) => {
    var location = req.params.location || null;
    service.getDailyReturnsReport(location, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    })
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
