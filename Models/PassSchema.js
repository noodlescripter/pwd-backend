const mongo = require('mongoose');
const Schema = mongo.Schema;



const PassSchema = new Schema({
    username:{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    passFor:{
        type: String, required: true, maxlength: 20
    },
    newPass: {type: String, required: true, maxlength: 15}
});

module.exports = mongo.model('Password', PassSchema);