const express = require('express')


//Access the connection to Heroku Database
const pool = require('../utilities/exports').pool

const router = express.Router()

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided


router.get("/", (request, response,next) => {
    next()
    // if(!request.body.token){

    //     response.status(400).send({
            
    //         message:"Missing required information"

    //     })
    // }
    // else{
    //     next()
    // }

},(request,response)=>{

    //let memberid = request.decoded.memberid

    let memberid = 54
    let query  = `SELECT memberid_b,firstname,lastname,username,verified
    FROM contacts JOIN members
    ON memberid_a = memberid
    WHERE memberid_a = 54
    ORDER BY verified`
    pool.query(query,memberid)
    .then(result=>{
        response.send({
            memberid:memberid,
            rowCount:result.rowCount,
            rows:result.rows


        })

    }).catch(err=>{

        response.status(400).send({

            message:"SQL Error",
            error:err
        })


    })
    


});

/**
 * @api {post} /hello Request a Hello World message
 * @apiName PostHello
 * @apiGroup Hello
 * 
 * @apiSuccess {String} message Hello World message
 */ 
router.post("/", (request, response) => {
    response.send({
        message: "Hello, you sent a POST request"
    })
})
// "return" the router
module.exports = router