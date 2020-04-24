var mongoose = require('mongoose');


mongoose.connect('mongodb+srv://nodeapp:nodeapp@cluster0-6d804.mongodb.net/test?retryWrites=true&w=majority',{ useUnifiedTopology:true,useNewUrlParser:true})
.then(() => {
    console.log('DB Connected!')
})
.catch(err => {
console.log(Error, err.message);
});;

module.exports = {mongoose}