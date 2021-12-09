//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const router = express.Router()

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided


router.post("/",(request,response,next)=>{ 

    if(!isStringProvided(request.body.email)){

        response.status(400).send({

            message:"Missing Required Information"

        })
    } else{

        next()

    }





},(request,response)=>{


    let params = [request.body.email]
    let theQuery = 'SELECT * FROM Members WHERE Email = $1 '
    pool.query(theQuery,params)
    .then(result=>{

        if(result.rowCount == 0 ){

            response.send({
                success:false
            })

        }else {

            response.send({

                success:true
            })



        }



    }).catch(err=>{

        response.status(400).send({

            message:"SQL error at Search Member"

        })
    })



})


module.exports = router



