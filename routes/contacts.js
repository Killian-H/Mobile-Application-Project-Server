//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided


const router = express.Router()



/**
 * @api {get} /contacts Request to get list of contacts 
 * @apiName GetContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Request to get list of contacts
 * 
 * @apiSuccess {Object[]} contacts List of contacts
 * 
 * @apiError (400: Missing required information) {String} message the missing token information
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *  
 * @apiUse JSONError
 */

router.get('/' , (request, response,next) => {

    if(!request.decoded.memberid){
        response.status(400).send({

           message: "Missing reuqired information"
        })
        
    } else {
        next()
    }
    
}, (request,response)=>{

    let memberid = [request.decoded.memberid]
    let theQuery = "SELECT Memberid_b,Firstname,Lastname,Username,Email,verified FROM Contacts JOIN Members ON Memberid_b = Memberid WHERE Memberid_a = $1 ORDER BY verified DESC"
    pool.query(theQuery,memberid)
    .then(result => {

        response.send({

            memberid:memberid,
            rowCounts:result.rowCount,
            rows:result.rows
        })
       
    })
    .catch((err) => {
        //log the error
       
        response.status(400).send({
            message: "SQL Error",
            error:err
        })
    })

})





router.post("/",(request,response,next)=>{
    
    if(!request.decoded.memberid || !request.body.memberid_b){
        response.status(400).send({

           message: "Missing reuqired information"
        })
        
    } else if(isNaN(request.body.memberid_b)){
       
        response.status(400).send({

            message: "Malformed parameter. memberid_b must be a number"

        })


    } else {
        next()
    }

},(request,response,next)=>{


    let theQuery = "SELECT * FROM Members WHERE Memberid = $1"
    let memberid_b = [request.body.memberid_b]

    pool.query(theQuery,memberid_b)
    .then(result=>{
        


        if(result.rowCount == 0){
            response.status(404).send({

                message:"memberid_b is not found"
            })

        } else{

            next()
        }


    }).catch(error=>{

        response.status(400).send({
            message: "SQL Error on memberid_b check",
            error: error

        })

    })


},(request,response,next)=>{



    let theQuery = "SELECT * FROM Contacts WHERE Memberid_a = $1 AND Memberid_b = $2"
    let values = [request.decoded.memberid,request.body.memberid_b]

    pool.query(theQuery,values)
    .then(result=>{

        if(result.rowCount == 1){

            response.status(404).send({

                message:"Memberid_b already existed in the contact"
                
            })

        } else {

            next()
        }



    }).catch(error=>{

        response.status(400).send({

            message:"SQL error occured at check memberid_b in contact",
            error:error
        })

    })
    

},(request,response)=>{

    const verified = 0;
    let values = [request.decoded.memberid,request.body.memberid_b,verified]
    let theQuery = "INSERT INTO Contacts(Memberid_a,Memberid_b,Verified) VALUES($1,$2,$3) RETURNING memberid_a AS memberid,memberid_b,verified"
    pool.query(theQuery,values)
    .then(result=>{

        if(result.rowCount == 1){

            response.send({
                
                success:true,
                row:result.rows[0]


            })
            

        } else {

            response.status(400).send({
                message:"Insert failed"
            })
        }


    }
        
        ).catch(error=>{

            response.status(400).send({

                message:"SQL Error on Insertion",
                error:error
            })
        }
        )
    
    

})


router.delete('/',(request,response,next)=>{

    if(!request.decoded.memberid || !request.body.memberid_b){

        response.status(400).send({

            messgae:"Missing Required Information"

        }) 

    }else if (isNaN(request.body.memberid_b)){


        response.status(400).send({

            message:"Misformed parameter,Memberid_b must be a number"
        })

    } else {
        next()


    }



},(request,response,next)=>{
    
    let values = [request.body.memberid_b]
    let theQuery = "SELECT * FROM Members WHERE Memberid = $1"
    pool.query(theQuery,values)
    .then(result=>{

        if(result.rowCount == 0 ){  
            
            response.status(404).send({

                message:"Memberid_b is not existed"

                })


        } else {
            next()
        }


    }).catch(error=>{

        response.status(400).send({
            messgae:"SQL Error occured at find memberid_b in the Members",
            error:error

        })
    })

},(request,response,next)=>{

    let values = [request.decoded.memberid,request.body.memberid_b]
    let theQuery = "SELECT * FROM Contacts WHERE Memberid_a = $1 AND Memberid_b = $2"
    pool.query(theQuery,values)
    .then(result=>{

        if(result.rowCount == 0 ){

            response.status(404).send({

                message : "memeberid_b is not found in the contact"

            })



        }else{

            next()

        }


    }).catch(error=>{

        response.status(400).send({

            message:"SQL error occured at finding memberid_in the contact",
            error:error
        })

    })

},(request,response)=>{

    let values = [request.decoded.memberid,request.body.memberid_b]

    let theQuery = "DELETE FROM contacts WHERE memberid_a = $1 AND memberid_b = $2 RETURNING *"
    pool.query(theQuery,values)
    .then(result=>{

        response.send({

            success:true,
            DeletedrowNum:result.rows[0]

        })
        

    }).catch(error=>{

        response.status(400).send({

            message:"DELETE FAILED",
            error:error

        })

    })


})




module.exports = router