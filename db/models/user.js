const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const UserSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
}, { timestamps: true }, {collection: 'user'}
);

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;