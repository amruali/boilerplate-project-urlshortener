let mongoose = require('mongoose');



const urrlSchema = mongoose.Schema({
    long_url :{
        type : String,
        required : true
    },
    short_url :{
        type : String,
        required : true
    }
});


const Url = mongoose.model('URL_ITEMS', urrlSchema);
module.exports = Url;
