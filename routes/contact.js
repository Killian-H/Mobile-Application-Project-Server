//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

const generateHash = require('../utilities').generateHash

const router = express.Router()


router.get('/' , (request, response) => {
    const theQuery = "SELECT * FROM Members WHERE Memberid = $1"
    const values = 6
    pool.query(theQuery, values)
        .then(result => { 

            response.send({

                memberid:values,
                rowCounts:result.rowCount,
                rows:result.rows


            })

            
            
        })
        .catch((err) => {
            //log the error
            
            response.status(400).send({
                message: "SQL Error"
            })
        })
})

module.exports = router