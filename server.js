const { Pool } = require('pg');
const express = require('express')
const path = require('path')
const service = require('./service.js');
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/view/:type/:location/:start/:end', (req, res) => {
    console.log("view req.params: " + req.params);
    var carType = req.params.type;
    var location = req.params.location;
    var startTime = req.params.start;
    var endTime = req.params.end;
    service.view(carType, location, startTime, endTime, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    });
  })
  .post('/reserve/:type/:location/:start/:end/:cellphone/:name', (req, res) => {
    let carType = req.params.type;
    let location = req.params.location;
    let startTime = req.params.start;
    let endTime = req.params.end;
    let cellphone = req.params.cellphone;
    let name = req.params.name;
    service.reserve(carType, location, startTime, endTime, cellphone, name, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    });
  })
  .post('/reserve/:type/:location/:start/:end/:cellphone/:name/:address/:dLicense', (req, res) => {
    let carType = req.params.type;
    let location = req.params.location;
    let startTime = req.params.start;
    let endTime = req.params.end;
    let cellphone = req.params.cellphone;
    let name = req.params.name;
    let address = req.params.address;
    let dLicense = req.params.dLicense;
    service.newCustomer(cellphone, name, address, dLicense, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      cellphone = result.phone;
      name = result.name;
      service.reserve(carType, location, startTime, endTime, cellphone, name, (err, result) => {
        if (err) {
          console.error(err);
          res.send("Error " + err);
        }
        res.send(result);
      });
    });
  })
  .post('/prepareRent/confNo/:confNo', (req, res) => {
    console.log("prepareRent using confNo");
    var confNo = req.params.confNo;
    service.prepareRent(confNo, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    })
  })
  .post('/prepareRent/cellPhone/:cellphone', (req, res) => {
    console.log("viewReservation using cellphone");
    var cellphone = req.params.cellphone;
    service.getConfNoFromCellphone(cellphone, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      let confNo = result.confNo;
      service.prepareRent(confNo, (err, result) => {
        if (err) {
          console.error(err);
          res.send("Error " + err);
        }
        res.send(result);
      })
    })
  })
  .post('/prepareRent/:type/:location/:start/:end/:cellphone/:name', (req, res) => {
    let carType = req.params.type;
    let location = req.params.location;
    let startTime = req.params.start;
    let endTime = req.params.end;
    let cellphone = req.params.cellphone;
    let name = req.params.name;
    service.reserve(carType, location, startTime, endTime, cellphone, name, (err, result) => {
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
  .post('/prepareRent/:type/:location/:start/:end/:cellphone/:name/:address/:dLicense', (req, res) => {
    let carType = req.params.type;
    let location = req.params.location;
    let startTime = req.params.start;
    let endTime = req.params.end;
    let cellphone = req.params.cellphone;
    let name = req.params.name;
    let address = req.params.address;
    let dLicense = req.params.dLicense;
    service.newCustomer(cellphone, name, address, dLicense, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      cellphone = result.phone;
      name = result.name;
      service.reserve(carType, location, startTime, endTime, cellphone, name, (err, result) => {
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
  .post('/rent/:confNo/:dLicense/:cardNo/:expiration', (req, res) => {
    console.log("rent");
    var confNo = req.params.confNo;
    var dLicense = req.params.dLicense;
    var cardNo = req.params.cardNo;
    var expiration = req.params.expiration;
    service.rent(confNo, dLicense, cardNo, expiration, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    })
  })
  .post('/return/:rentId/:date/:time/:odometer/:fullTank/:value', (req, res) => {
    service.return(rentId, date, time, odometer, fullTank, value, (err, result) => {
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
    var location = req.params.location;
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
    var location = req.params.location;
    service.getDailyReturnsReport(location, (err, result) => {
      if (err) {
        console.error(err);
        res.send("Error " + err);
      }
      res.send(result);
    })
  })
  .get('/db', async (req, res) => {
    console.log("/db")
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true  
});