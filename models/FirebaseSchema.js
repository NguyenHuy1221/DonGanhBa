const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { convertToVietnamTimezone } = require('../middleware/index');

const FireBaseSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    firebaseToken: { type: Schema.Types.ObjectId, required: true },

});

convertToVietnamTimezone(FireBaseSchema);

const FireBase = mongoose.model('FireBase', FireBaseSchema);

module.exports = FireBase;
