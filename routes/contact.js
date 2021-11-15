//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided


const router = express.Router()


router.get('/' , (request, response) => {
    let theQuery = "SELECT * FROM Members WHERE Memberid = $1"
    let memberid = 54
    pool.query(theQuery, memberid)
        .then(result => { 

            response.send({

               
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