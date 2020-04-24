var express = require('express');
var http = require('http');
var socket = require('socket.io')
var bodyparser = require('body-parser');
var cors = require('cors');
const fileUpload = require('express-fileupload');
var path = require('path');
var mongoosedb = require('mongoose')

/*== local imports ==*/

var {mongoose} = require('./db/mongoose');
var {userModel} = require('./users/user');
var {chatmodel} = require('./users/chat');
var {authentiateUser, checkDuplicatedata,hashPassword} = require('./checkauth/authenticate');
var paginator = require('./utils/pagination-helper');
var {Social} = require('./checkauth/socialclass')
var app = express();
var server = http.createServer(app)
var io = socket(server);
var social = new Social();
app.use(express.static(__dirname+'/images'));

app.use(cors({
    exposedHeaders: ['Content-Length', 'x-auth'],
  }));
//app.options('*', cors());
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

app.use(fileUpload());

app.get('/',(req,res)=>{
    res.send('server is up and running on port 3000');
})
/*===Registration===*/
app.post('/register',async (req,res)=>{
    var name = req.body.name;
    var email = req.body.email;
    var contact = req.body.contact;
    var organisation = req.body.organisation;
    var designation = req.body.designation;
    var role = req.body.role;
    var userid = req.body.userId;
    var password = req.body.password;
    var status = req.body.status;
    var created_by = req.body.created_by;
    var userimage = '';

    try{
        var is_email = await checkDuplicatedata({email:email});
        var is_contact = await checkDuplicatedata({contact:contact});
        var is_userid = await checkDuplicatedata({userid:userid});
        if(is_email.status == 0){
            res.send({status:0,'res':'This email is already exist'});
            return false;
        }
        if(is_contact.status == 0){
            res.send({status:0,'res':'This contact is already exist'});
            return false;
        }
        if(is_userid.status == 0){
            res.send({status:0,'res':'This User ID is already exist'});
            return false;
        }

        //=========file uploading=====//
        let userImg = req.files.user_img;
        var uploadRes = await userFileUpload(userImg);
        if(uploadRes.status == 0){
            res.send({status:0,'res':'File uploading fail'});
            return false;
        }
        var userBody = new userModel({
            name,
            email,
            contact,
            organisation,
            role,
            userid,
            password,
            userimage:userImg.name,
            status,
            created_at:new Date(),
            created_by
        });
        var token = await userBody.generateAuthtoken();
        let data = {
            name:userBody.name,
            email:userBody.email,
            contact:userBody.contact
        }
        res.header('x-auth',token).send({status:1,data,res:'User created successfully'});

    }catch(e){
        console.log(e)
        res.send({status:0,data:'Some problem occured on server'});
    }
   
})

app.post('/updateUser',async (req,res)=>{

    var user_id = req.body.edited_userid;
    if(!mongoose.mongo.ObjectID.isValid(user_id)){
        res.send({status:0,'upd_res':'Userid is not valid'});
    }
    var name = req.body.name;
    var email = req.body.email;
    var contact = req.body.contact;
    var organisation = req.body.organisation;
    var designation = req.body.designation;
    var role = req.body.role;
    var userid = req.body.userId;
    var password = req.body.password;
    var status = req.body.status;
    var created_by = req.body.created_by;
    var userimage = '';

    try{
        var is_email = await checkDuplicateOnUpdate('email',email,user_id);
        var is_contact = await checkDuplicateOnUpdate('contact',contact,user_id);
        var is_userid = await checkDuplicateOnUpdate('userid',userid,user_id);
        if(is_email.status == 0){
            res.send({status:0,'upd_res':'This email is already exist'});
            return false;
        }
        if(is_contact.status == 0){
            res.send({status:0,'upd_res':'This contact is already exist'});
            return false;
        }
        if(is_userid.status == 0){
            res.send({status:0,'upd_res':'This User ID is already exist'});
            return false;
        }

        //=========file uploading=====//
        
        if(req.files && req.files.user_img!=''){
            let userImg = req.files.user_img;
            var imageName = userImg.name;
            var uploadRes = await userFileUpload(userImg);
            if(uploadRes.status == 0){
                res.send({status:0,'upd_res':'File uploading fail'});
                return false;
            }
        }else{
            var imageName = '';
        }
        if(password){
            var hashed_pass = await hashPassword(password);
            if(hashed_pass.status == 1){
                password = hashed_pass.pass;
            }else{
                res.send({status:0,'upd_res':'Some issue in hashing the password'});
            }
        }
        var userBody ={
            name,
            email,
            contact,
            organisation,
            role,
            userid,
            password,
            userimage:imageName,
            status,
            created_at:new Date().getDate(),
            created_by
        };
        /* console.log(userBody);
        return false; */
        if(password==''){
            delete userBody.password;
        }
        if(imageName==''){
            delete userBody.userimage;
        }
        
        var updRes = await userModel.findOneAndUpdate({_id:new mongoose.mongo.ObjectID(user_id)},{$set:userBody},{new:true,useFindAndModify: false});
        if(updRes){
            res.send({status:1,upd_res:'User Updated successfully'})
        }else{
            res.send({status:0,data:'Some problem occured on server'});
        }

    }catch(e){
        res.send({status:0,upd_res:'Some problem occured on server'});
    }
   
})

app.post('/authByToken',(req,res)=>{

    var token = req.header('x-auth');
    userModel.findByToken(token).then((result)=>{
        res.set('x-auth',token);
        res.set('Access-Control-Expose-Headers', 'x-auth').send({status:1,data:result});
    }).catch((res_err)=>{
        res.send({status:0,'res':'Invalid Token'});
    })
})

app.post('/login',(req,res)=>{

    var username = req.body.userid;
    var password = req.body.password;

    userModel.authByCredentials(username,password).then((succ_res)=>{
        return succ_res.generateAuthtoken().then((token)=>{
            res.header('x-auth',token).send({'status':1,data:succ_res})
        })
    }).catch((err_res)=>{
        res.send({status:0,err_res});
    })
})

app.post('/getUser',authentiateUser,(req,res)=>{

    let dbCon = {};
    let offset = parseInt(req.body.offset) || 0;
    let per_page = req.body.perpage || 10;
    console.log(offset)
    userModel.find(dbCon)
            .skip(offset)
            .limit(per_page)
            .exec((err,doc)=>{
                if(err){
                    res.send({status:0,res:'No Record Found'}); 
                }
                console.log(doc)
                userModel.countDocuments(dbCon).exec((count_err,db_count)=>{
                    if(count_err){
                        res.send({status:0,res:'No Record Found'}); 
                    }
                    
                    res.send({status:1,res:doc,total_rec:db_count}); 
                })
            })  
})

app.delete('/deleteUser',authentiateUser,(req,res)=>{
    
    var user_id = req.body.user_id;
    if(user_id==''){
        res.send({status:0,delRes:'Invalid User'})
    }
    userModel.findOneAndDelete({_id:new mongoosedb.mongo.ObjectId(user_id)}).then((del_res)=>{
        if(del_res){
            res.send({status:1,delRes:'User has been deleted successfully'})
        }else{
            res.send({status:0,delRes:'User not found'})
        }
    }).catch((e)=>{
        res.send({status:0,delRes:'User not found'})
    })

})
app.post('/getOneUser',authentiateUser,(req,res)=>{
    var user_id = req.body.user_id;
    if(!mongoose.mongo.ObjectID.isValid(user_id)){
        res.send({status:0,'res':'Userid is not valid'});
    }
    if(user_id==''){
        res.send({status:0,delRes:'Invalid User'})
    }
    userModel.find({_id:new mongoose.mongo.ObjectID(user_id)}).then((userData)=>{
        
        if(userData.length){
            res.send({status:1,user_res:userData[0]});
        }else{
            res.send({status:0,user_res:'No record found'});
        }
    }).catch((e)=>{
        res.send({status:0,user_res:'No record found'})
    })
})

app.post('/getallActiveuser',authentiateUser,(req,res)=>{
    var user_id = req.body.userid;
    if(user_id == '' || user_id == 0){
        res.send({status:0,res:'Invalid user'})
    }
    if(!mongoose.mongo.ObjectID.isValid(user_id)){
        res.send({status:0,'res':'Userid is not valid'});
    }
    userModel.find({status:1,_id:{$ne:new mongoose.mongo.ObjectID(user_id)}},{_id:1,name:1,email:1,contact:1,userimage:1}).then((userdata)=>{
        
        if(userdata.length){
            var userObject = JSON.parse(JSON.stringify(userdata))
            var userList = Array();
        userList = userObject.filter((oserobj)=>{
                oserobj.online = "no";
                return oserobj;
           })
        res.send({status:1,res:userList})
       }else{
        res.send({status:'0',res:'No user found'})
       }
        
    }).catch((e)=>{
        res.send({status:'0',res:'Some problem in fetching user'})
    })
})

app.post('/getTwoUserChat',authentiateUser,(req,res)=>{
    var reciever_id = req.body.to_userid;
    var sender_id = req.body.from_userid;
    if(sender_id == '' || sender_id == 0){
        res.send({status:0,res:'Sender ID is required'})
    }
    if(reciever_id == '' || reciever_id == 0){
        res.send({status:0,res:'Reciever ID is required'})
    }
    if(!mongoose.mongo.ObjectID.isValid(reciever_id)){
        res.send({status:0,'res':'Reciever ID is not valid'});
    }
    if(!mongoose.mongo.ObjectID.isValid(sender_id)){
        res.send({status:0,'res':'Sender ID is not valid'});
    }
    chatmodel.find({$or:
        [
            {
                $and:[{'sender_id':mongoose.mongo.ObjectID(sender_id),'reciever_id':mongoose.mongo.ObjectID(reciever_id)}]
            },
            {
                $and:[{'sender_id':mongoose.mongo.ObjectID(reciever_id),'reciever_id':mongoose.mongo.ObjectID(sender_id)}]
            }
        ]
    },{_id:0,sender_id:1,reciever_id:1,chat_text:1}).then((chat_data)=>{
        res.send({status:1,chat_data})
    }).catch((e)=>{
        res.send({status:0,chat_data:'Some error found'})
    })
})
var userFileUpload = (userImg)=>{
    
    return new Promise((resolve,reject)=>{
        userImg.mv(__dirname+'/images/user/'+userImg.name, (err)=> {
            if (err){
                return resolve({status:0,fres:'file not uploaded'});
            }else{
                return resolve({status:1,fres:'file uploaded'}); 
            }
        });
    })    
}

io.on('connection', (socket)=>{
    console.log('User has connected');

    
    socket.on('getAllOnlineUser',async function(data){
        try{
        var isOnlineUser = social.getOnlineUser();
        if(isOnlineUser.length) {
            var updatedOnlineUsers = social.makeOnline(isOnlineUser,data,socket.id);
        }else{
            var user = await social.getAllUser();   
            var updatedOnlineUsers = social.makeOnline(user,data,socket.id);
        }
        socket.join(data.userId);
        io.emit('allOnlineUser',updatedOnlineUsers);
        }catch(e){
            console.log(e)
        }
    })

    socket.on('sendPrivateMessage',async (data)=>{
        
        let msgSaveRes = social.saveChat(data);
        
        var isOnline = social.checkIsUserOnline(data)
        
        if(isOnline[0].online == "yes"){
            socket.broadcast.to(data.toId).emit('transferMessage',{
                sender_id:data.toId,
                reciever_id:data.fromId,
                chat_text:data.text
            });
        }
        
        
        socket.emit('transferMessage',{
            sender_id:data.toId,
                reciever_id:data.fromId,
                chat_text:data.text
        })
    })
    socket.on('disconnect',(data)=>{
        var leavingUser = social.getSingleUserDetail(socket.id)
        if(leavingUser.length){
            socket.leave(leavingUser[0]._id)
        }
        var updatedoffilneUsers = social.makeOffline(socket.id)
        io.emit('allOnlineUser',updatedoffilneUsers);
        //console.log(leavingUser[0].name+' has left')
    })

})
server.listen(3000,'0.0.0.0',()=>{
    console.log('server is runing on port 3000');
})
