//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided
let isBooleanProvide = validation.isBooleanProvide

const contact_function = require('../utilities/exports').messaging

const router = express.Router()





/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */ 

/**
 * @api {get} /contacts Request to get contact list
 * @apiName GetContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Request to get list of contacts
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess {Object[]} the contact list of the user
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
    let theQuery = "SELECT Memberid_b AS memberid,Firstname,Lastname,Username,Email,verified FROM Contacts JOIN Members ON Memberid_b = Memberid WHERE Memberid_a = $1 ORDER BY verified DESC"
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



/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */ 

/**
 * @api {get} /contacts/requests Request to get list of incoming contact requests. 
 * @apiName GetContactRequests
 * @apiGroup Contacts
 * 
 * @apiDescription Request to get list of incoming contact requests. 
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiSuccess {Object[]} the contact list of the user
 * 
 * @apiError (400: Missing required information) {String} message the missing token information
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *  
 * @apiUse JSONError
 */

 router.get('/requests' , (request, response,next) => {

    if(!request.decoded.memberid){
        response.status(400).send({

           message: "Missing reuqired information"
        })
        
    } else {
        next()
    }
    
}, (request,response)=>{

    let memberid = [request.decoded.memberid]
    let theQuery = "SELECT Memberid_a as MemberId,Firstname,Lastname,Username,Email,verified FROM Contacts JOIN Members ON Memberid_a = Memberid WHERE Memberid_b = $1 and verified = 0 ORDER BY Firstname ASC"
    pool.query(theQuery,memberid)
    .then(result => {

        response.send({

            memberid:memberid[0],
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




/**
 * @apiDefine JSONError
 * 
 * @api {post} /search  search a user from the database for adding other users to the contact
 * @apiName SearchContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Search a user by its id,username or email
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * @apiParam {Number}memberid memberid to search the user
 * @apiParam {String}email email to search the user
 * @apiParam {String}username username to search the user
 * 
 * @apiParamExample {json} Request-Body-Example:
 *  
 *     {
 *       "memberid": 35,
 *       "email": "zhong4475@gmail.com",
 *       "username": "zhong4475@gmail.com"
 *     } 
 * 
 * @apiSuccess {boolean} success true user is found from the database
 * @apiSuccess {number} rowNum number of rows return from the SQL query
 * @apiSuccess {Object[]} rows the rows contain the user information included its id, first name,last name,email and username
 * 
 * @apiError (400: Missing required information) {String} message "Missing require information"
 * 
 * @apiError (404: unknown user) {String} user is not found
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *  
 * @apiUse JSONError
 */

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





/**
 * @api {post} /contacts add a user into the contacts 
 * @apiName PostContacts
 * @apiGroup Contacts
 * 
 * @apiDescription Insert a user into the contacts
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * 
 * @apiParam {Number} memberid_b the member id to insert into the contact
 * 
 * @apiParamExample {json} Request-Body-Example:
 *  
 *     {
 *       "memberid_b": 35
 *       
 *     } 
 * 
 * 
 * 
 * @apiSuccess {boolean} success true when the user sucessfully inserted
 * @apiSuccess {} 
 * 
 * 
 * @apiError (400: Missing required information) {String} message "Missing required information"
 * 
 * @apiError (400: Malformed parameter) {String} message "the memberid_b must be a number"
 * 
 * @apiError (404: unknown memberid) {String} message "the user is not found"
 *
 * @apiError (400: memberid is existed in the contact) {String} message "Memberid_b already existed in the contact"
 *  
 * @apiError (404:memberid_b pushy_token not found) {String} message "The device assoicated with the memberid has not been registered to the pushy yet"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 * 
 *  
 * @apiUse JSONError
 */

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

            response.status(400).send({

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
},
(request,response)=>{
    
    var token;
    let values = [request.body.memberid_b]
    let theQuery = `SELECT memberid,Token FROM push_token WHERE memberid = $1`
    pool.query(theQuery,values)
    .then(result=>{

        if(result.rowCount == 0){

            response.status(200).send({

                message:"memberid_b pushy_token not found"

            })
        }

        else{
            console.log("Memberid:"+result.rows[0].memberid)
            
            token = result.rows[0].token

        }

    }).catch(err=>{

        response.status(400).send({
            message: "SQL Error on select from push token for unverified member",
            error: err
        })

    })

    let values1 = [request.decoded.memberid]
    let theQuery1 = `SELECT Username FROM Members WHERE memberID = $1`
    pool.query(theQuery1,values1)
    .then(result=>{

        console.log("Member Pushy_token: "+token)

        contact_function.sendContactToIndividual(token,result.rows[0].username,request.decoded.memberid)

        response.send({
            success:true,
            message:"Contact added successfully!!"

        })


    })
})


/**
 * @api {delete} /contacts delete a user from the contact
 * @apiName DeleteContacts
 * @apiGroup Contacts
 * 
 * @apiDescription remove a memberid_b from the contact
 * @apiHeader {String} authorization Valid JSON Web Token JWT
 * 
 * 
 * @apiParam {Number} memberid_b the member id to remove from the contact
 * 
 * @apiParamExample {json} Request-Body-Example:
 *  
 *     {
 *       "memberid_b": 35
 *       
 *     } 
 * 
 * 
 * 
 * @apiSuccess {boolean} success true when the user is sucessfully deleted
 * @apiSuccess {Object[]} row the deleted row information
 * 
 * 
 * @apiError (400: Missing required information) {String} message "Missing required information"
 * 
 * @apiError (400: Malformed parameter) {String} message "the memberid_b must be a number"
 * 
 * @apiError (404: unknown memberid) {String} message "the user is not found"
 *
 * @apiError (400: unkown memberid in the contact) {String} message "Memberid_b is not in the contact"
 * 
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 * 
 *  
 * @apiUse JSONError
 */


router.delete('/:memberid_b',(request,response,next)=>{
    if(!request.decoded.memberid || !request.params.memberid_b){

        response.status(400).send({

            messgae:"Missing Required Information"

        }) 

    }else if (isNaN(request.params.memberid_b)){


        response.status(400).send({

            message:"Misformed parameter,Memberid_b must be a number"
        })

    } else {
        next()


    }



},(request,response,next)=>{
    
    let values = [request.params.memberid_b]
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

    let values = [request.decoded.memberid,request.params.memberid_b]
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

    let values = [request.decoded.memberid,request.params.memberid_b]

    let theQuery = "DELETE FROM contacts WHERE (memberid_a = $1 AND memberid_b = $2) OR (memberid_a = $2 AND memberid_b = $1) RETURNING *"
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


router.post("/verify",(request,response,next)=>{
   
    console.log("-------------------------------------")
    console.log("Verify option: "+request.body.option)

    if(!request.decoded.memberid ||!isBooleanProvide(request.body.option)||!request.body.memberid){
        response.status(400).send({
           message: "Missing reuqired information"
        })
    }  else {
        next()    
    }
},(request,response,next)=>{

    let pushyvalues = [request.decoded.memberid,request.body.memberid]
    let pushyQuery = `SELECT Contacts.memberid_a As memberid, Members.username AS username, Push_token.token AS token  
                      FROM Contacts INNER JOIN Members ON memberid = memberid_a 
                      INNER JOIN Push_Token ON memberid_b = Push_token.memberid 
                      WHERE memberid_a = $1 AND memberid_b = $2`
    
    pool.query(pushyQuery,pushyvalues)
    .then(result=>{

        let token = result.rows[0].token

        console.log("Notify memberid : "+request.body.memberid)
        console.log("Notify memberid token :"+token)
        let username = result.rows[0].username
        console.log("Contact request accpcted by memberid : "+result.rows[0].memberid)
        console.log("Contact request accepted by  username :"+username)
       
        contact_function.sendVerifyStatus(token,username,request.decoded.memberid,request.body.option)

    })

    next()

},(request,response)=>{

    var values,theQuery
    if(request.body.option){
        values = [request.decoded.memberid,request.body.memberid]
        theQuery = " UPDATE Contacts SET Verified = 1 WHERE (Memberid_a = $2 AND Memberid_b = $1 ) RETURNING *"
        pool.query(theQuery,values)
        .then(result=>{
            console.log("DataBase updated:")
            console.log(result.rows[0])
        }
        ).catch(err=>{
            response.status(400).send({
                message:"SQL error at update verified",
                err
            })
            return;
        })

        let theQueryA = "INSERT INTO Contacts(Memberid_a,Memberid_b,Verified) VALUES($1,$2,1) RETURNING memberid_a AS memberid,memberid_b,verified"
        pool.query(theQueryA,values)
        .then(result=>{
            if(result.rowCount == 1){
                response.status(200).send({
                    message :"Updated successfully!Verified code = 1",
                    updatedrows:result.rows
                })
            } else {
                response.status(400).send({
                    message:"Insert failed"
                })
            }
        })
        .catch(error=>{
            response.status(400).send({
                message:"Inserted Failed",
                message:error
            })
        }
        )
         
        

    }else{


        values = [request.decoded.memberid,request.body.memberid]
        theQuery = " DELETE FROM contacts WHERE (memberid_a = $1 AND memberid_b = $2) OR (memberid_a = $2 AND memberid_b = $1) RETURNING *"
        pool.query(theQuery,values)
        .then(result=>{

            console.log("DataBase deleted:")
            console.log(result.rows[0])
            console.log(result.rows[1])

            response.status(200).send({

                message :"Removed successfully!User declined contact request",
                deletedrows:result.rows


            })
            

        }
        ).catch(err=>{

            response.status(400).send({
                message:"SQL error at deleted verified",
                err

            })

        })
    }
    
   
       




   
})




module.exports = router