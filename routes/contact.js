//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided


const router = express.Router()


router.get('/' , (request, response) => {


    let theQuery = "SELECT Memberid_b,Firstname,Lastname,Username,verified FROM Contacts JOIN Members ON Memberid = Memberid_a WHERE Memberid = $1 ORDER BY verified DESC"
    let memeberid  = request.body.memeberid
    pool.query(theQuery,memeberid)
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