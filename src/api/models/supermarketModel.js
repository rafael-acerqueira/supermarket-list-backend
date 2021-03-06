var mongoose = require('mongoose')
var Schema = mongoose.Schema

var SupermarketSchema = new Schema({
  name: { type: String, required: true, trim: true }
},
  { timestamps: { createdAt: 'createdDate',updatedAt: 'updatedDate' }}
)

module.exports = mongoose.model('Supermarket', SupermarketSchema)