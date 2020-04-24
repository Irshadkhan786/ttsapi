var {userModel} = require('./../users/user');
var bcryptjs = require('bcryptjs');
var mongoose = require('mongoose');
var authentiateUser = (req,res,next)=>{

    var token = req.header('x-auth');
    userModel.findByToken(token).then((result)=>{
        res.user = result;
        res.token = token;
        next();
    }).catch((res_err)=>{
        res.send({status:0,'res':'Invalid Token'});
    })
}

var checkDuplicatedata =  (userObj)=>{
    
    return  userModel.findOne(userObj).then((data)=>{
            if(data){
                return  Promise.resolve({status:0});
            }else{
                return  Promise.resolve({status:1});
            }
         
        
    })
}

checkDuplicateOnUpdate = (fieldname,fieldvalue,id)=>{
    return userModel.find({[fieldname]:fieldvalue,_id:{$ne:new mongoose.mongo.ObjectID(id)}},{_id:1}).then((data)=>{
        if(data.length>0){
            return  Promise.resolve({status:0});
        }else{
            return  Promise.resolve({status:1});
        }
    })
}


hashPassword = (password)=>{
    return new Promise((resolve,reject)=>{
        bcryptjs.genSalt(10,(err,salt)=>{
            if(err){
                return resolve({status:0,pass:'no pass'})
            }
            bcryptjs.hash(password,salt,(hasserror,passhash)=>{
                if(hasserror){
                    return resolve({status:0,pass:'no pass'})
                }
                return resolve({status:1,pass:passhash})
            })
        })
    })
}
module.exports = {
    authentiateUser,
    checkDuplicatedata,
    hashPassword
}