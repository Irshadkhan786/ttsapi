var {userModel} = require('./../users/user');
var {chatmodel} = require('./../users/chat');

var mongoosedb = require('mongoose')
class Socialclass{

    allOnlineUser = Array();

        constructor(){

        }

        getOnlineUser(){
            return this.allOnlineUser;
        }
        
        getAllUser(){
        return userModel.find({status:1},{_id:1,name:1,email:1,contact:1,userimage:1,created_at:1,last_seen:1}).then((allusers)=>{
            var userObject = JSON.parse(JSON.stringify(allusers))
            var userList = Array();
           
            userList = userObject.filter((oserobj)=>{
                oserobj.online = "no";
                oserobj.socket_id = "";
                
                return oserobj;
            })
            return userList;
            }).catch((error)=>{
                return 'Some error found'
            })
        }

        makeOnline(allUsers,currUserObj,socketid){
            var allUserObject = JSON.parse(JSON.stringify(allUsers));
            
            this.allOnlineUser = allUserObject.filter((eachUserObj)=>{
               // console.log(currUserObj.userId)
                if(eachUserObj._id == currUserObj.userId){
                    eachUserObj.online = "yes"
                    eachUserObj.socket_id = socketid;
                    let last_seen = new Date();
                    userModel.findByIdAndUpdate(eachUserObj._id,{last_seen}).then((lastseen)=>{

                    })
                    eachUserObj.last_seen = last_seen;
                }
                console.log('make online',eachUserObj);
                return eachUserObj
            })
            return this.allOnlineUser;
        }
        makeOffline(socketid){ 
            this.allOnlineUser = this.allOnlineUser.filter((eachUserObj)=>{
                // console.log(currUserObj.userId)
                 if(eachUserObj.socket_id == socketid){
                     eachUserObj.online = "no";
                     userModel.findByIdAndUpdate(eachUserObj._id,{last_seen: new Date()}).then((lastseen)=>{

                     })
                 }
                
                 return eachUserObj
             })
             return this.allOnlineUser;
        }

        getSingleUserDetail(socket_id){
            
            var leavinguser = Array();
              leavinguser = this.allOnlineUser.filter((user)=>{
                 
                if(user.socket_id == socket_id){
                   
                    return user;
                }
            })
            
            return leavinguser;
        }

        checkIsUserOnline(chat_obj){
            var online_status;
             return this.allOnlineUser.filter((user)=>{
                if(user._id==chat_obj.toId){
                    
                    return user;
                }
                
            })
        }
        
        saveChat(chat_obj){
            
            var saveObj = {
                sender_id: mongoosedb.mongo.ObjectID(chat_obj.fromId) ,
                reciever_id:mongoosedb.mongo.ObjectID(chat_obj.toId),
                chat_text:chat_obj.text
            };
            var newChatModal = new chatmodel(
                saveObj
            )
            return newChatModal.save(saveObj).then((save_res)=>{
                return {status:1,res:'saved successfully'}
            }).catch((e)=>{
                return {status:0,res:'Some problem occur on server'}
            })
        }

}

module.exports = {Social:Socialclass}