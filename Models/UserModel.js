const mongo = require('mongoose');
const Shecha = mongo.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const User = new Shecha({
    username:{
        type: String,
        required: true,
        unique: true
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongo.model('User', User);