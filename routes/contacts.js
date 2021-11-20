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

router.post("/search",(request,response,next)=>{

    console.log(request.body.username)
    console.log(request.body.email)
    console.log(request.body.memberid)
    

    if(!isStringProvided(request.body.username) & !isStringProvided(request.body.email) & isNaN(request.body.memberid)){


        response.status(400).send({

            message:"Missing required information"

        })

    } else {

        next()
    }


},(request,response)=>{

    var values;
    var requestKey;
    var theQuery;

    let length = Object.keys(request.body).length
    
    if(length == 1){

        if(!isNaN(request.body.memberid)) {

        requestKey = "Memberid"
        values = [request.body.memberid]
   
        } else {

            if(isStringProvided(request.body.username)){

            requestKey = "Username"
            values =[request.body.username]


        } else {

                requestKey = "Email"
                values = [request.body.email]
             }

    }

    theQuery = "Select memberid,firstname,lastname,username,email FROM Members WHERE "+requestKey+"=$1"
    
    
    } else if(length == 2) {
    if(isStringProvided(request.body.username) & isStringProvided(request.body.email)){

        values =[request.body.username,request.body.email]
        theQuery = "Select memberid,firstname,lastname,username,email FROM Members WHERE Username = $1 AND Email = $2"

    } else if(isStringProvided(request.body.username) & !isNaN(request.body.memberid)){
        
        values =[request.body.username,request.body.memberid]
        theQuery = "SELECT memberid,firstname,lastname,username,email FROM Members WHERE Username = $1 AND Memberid = $2"

    } else {
        
        values =[request.body.email,request.body.memberid]
        theQuery = "SELECT memberid,firstname,lastname,username,email FROM Members WHERE Email = $1 AND Memberid = $2"

    }
    }else{
        
        values =[request.body.username,request.body.email,request.body.memberid]
        theQuery = "SELECT memberid,firstname,lastname,username,email FROM Members WHERE Username = $1 AND Email = $2 AND Memberid = $3"


    }
    console.log("The final values is "+values)
    console.log("The final query is "+theQuery)


    pool.query(theQuery,values)
    .then(result=>{
        
        if(result.rowCount == 0){

            response.status(404).send({

                message:"User is not found"

            }
            
            )

        }

        else {

            response.send({

                success : true,
                rowNum:result.rowCount,
                rows:result.rows


            })

        }


    }
        
        ).catch(error=>{

            response.status(400).send({
                message:"SQL error occured at searching user",
                error:error


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
    

},(request,response,next)=>{

    const verified = 0;
    let values = [request.decoded.memberid,request.body.memberid_b,verified]
    let theQueryA = "INSERT INTO Contacts(Memberid_a,Memberid_b,Verified) VALUES($1,$2,$3) RETURNING memberid_a AS memberid,memberid_b,verified"
    pool.query(theQueryA,values)
    .then(result=>{

        if(result.rowCount == 1){

           next()
            

        } else {

            response.status(400).send({
                message:"Insert failed"
            })
        }


    }
        
        ).catch(error=>{

            response.status(400).send({

                message:"Inserted Failed",
                message:error
            })

           
        }
        )

},(request,response)=>{


    const verified = 0;
    let values = [request.body.memberid_b,request.decoded.memberid,verified]
    let theQueryA = "INSERT INTO Contacts(Memberid_a,Memberid_b,Verified) VALUES($1,$2,$3) RETURNING memberid_a AS memberid,memberid_b,verified"
    pool.query(theQueryA,values)
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

                message:"Inserted Failed",
                message:error
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