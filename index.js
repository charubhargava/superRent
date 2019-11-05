// const { Pool } = require('pg');
const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .get('/cool', (req, res) => res.send(cool()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true
// });
