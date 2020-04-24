var mongoose = require('mongoose');
var chatscheema = mongoose.Schema({
    sender_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
        require:true
    },
    reciever_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
        require:true
    },
    chat_text:{
        type:String,
        require:true
    },
    date:{
        type:Date
    }
})

var chatmodel = mongoose.model('chat',chatscheema);

module.exports = {
    chatmodel 
}