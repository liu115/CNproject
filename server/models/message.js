var mongoose = require('mongoose');
// var autoIncrement = require('mongoose-auto-increment');
var setting = require('../config/config');
const dburl = `mongodb://${setting.username}:${setting.password}@${setting.mongoUrl}`;

var msgDB = mongoose.createConnection(`${dburl}/messages/?ssl=true`, (err) => {
  if (err) {
    console.log('Message DB Connection Error: ' + err);
  }
});

// autoIncrement.initialize(msgDB);

const options = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const MsgSchema = new mongoose.Schema({
  // messageId: { type: String, required: true },
  content: { type: String, required: true },
  from: { type: String, require: true },
  to: { type: String, require: true }
}, options);

// MsgSchema.plugin(autoIncrement.plugin, { model: 'Message', field: 'msgId'});
module.exports = msgDB.model('Message', MsgSchema);
