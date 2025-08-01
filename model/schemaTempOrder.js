var mongoose = require('mongoose');

let TempOrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true },
  orderData: { type: Object, required: true },                
  created_at: { type: Date, default: Date.now }               
}, {
  collection: "TempOrders"
});

module.exports = TempOrderSchema
