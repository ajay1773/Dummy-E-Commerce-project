const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Userdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.once('open', () => {
        console.log("Connected...")
    })
    .on('error', () => {
        console.log("Error occured")
    });

//Creating schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});
const User = mongoose.model('User', UserSchema);
module.exports = User;