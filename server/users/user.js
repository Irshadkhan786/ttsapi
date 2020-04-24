var mongoose = require('mongoose');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
var getConfig = require('./../db/config');
var userScheema = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    contact:{
        type:String,
        require:true
    },
    organisation:{
        type:String,
        require:true
    },
    designation:{
        type:String,
        require:true
    },
    role:{
        type:Number,
        require:true
    },
    userid:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    userimage:{
        type:String
    },
    status:{
        type:Number
    },
    created_at:{
        type:Date,
        require:true
    },
    updated_at:{
        type:String
    },
    created_by:{
        type:String,
        require:true
    },
    updated_by:{
        type:Date
    },
    last_seen:{
        type:String
    },
    tokens:[
        {
            access:{
                type:String,
                required:true
            },
            token:{
                type:String,
                require:true
            }
        }
    ],
    chat:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'chat',
        require:true
    }]
})

/*===hashing of password===*/
userScheema.pre('save',function(next){
     var user = this;
    if(user.isModified('password')){
        bcryptjs.genSalt(10,(err,salt)=>{
           
            if(err){
                next();
            }else if(!salt){
                next();
            }else{
                bcryptjs.hash(user.password,salt,(haserr,passhash)=>{
                    if(haserr){
                        next();
                    }else if(!passhash){
                        next();
                    }else{
                        user.password = passhash;
                        next();
                    }
                })
            }
        })
    }else{
        next();
    }
})

userScheema.methods.generateAuthtoken = function(){
    var user = this;
    var token_secrate = getConfig.getSecret();
    var access = 'auth';
    var tokenObj = {_id:user._id,access:access}
    var token = jwt.sign(tokenObj,token_secrate);
    user.tokens.push({access:access,token:token});

    return user.save().then(()=>{
        return token;
    });

}

userScheema.statics.findByToken = function(token){
    var user = this;
    var decode;
    try{
        decode = jwt.verify(token,getConfig.getSecret());
    }catch(e){
        return new Promise((resolve,reject)=>{
            return reject({'reason':'Invalid Token'});
        });
    }

    return user.findOne({'_id':decode._id,'tokens.token':token,'tokens.access':decode.access});
}

userScheema.statics.authByCredentials = function(userid,password){
    var user = this;
    return user.findOne({userid:userid}).then((user_res)=>{
        
        if(!user_res){
            return new Promise((resolve,reject)=>{
                return reject({'reason':'Invalid Username'});
            })
        }
        
        return new Promise((resolve,reject)=>{
            bcryptjs.compare(password,user_res.password,(pass_err,pass_succ)=>{
                if(pass_err){
                    return reject({'reason':'Wrong password'})
                }else if(!pass_succ){
                    return reject({'reason':'Wrong password'});
                }else{
                    return resolve(user_res);
                }
            })
        })
    })
}
userModel = mongoose.model('users',userScheema);

module.exports = {
    userModel
}