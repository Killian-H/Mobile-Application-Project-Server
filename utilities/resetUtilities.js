
/**
 * Get the random code for resetting passowrd
 * 
 * @returns 6 random characters code
 */
function getCode(){
    const length = 6;

    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    for(var i = 0 ; i<length; i++){

        result += characters.charAt(Math.floor(Math.random() * characters.length));

    }

    return result;


}





module.exports = { 
    getCode

}