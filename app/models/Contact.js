'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var contactSchema = Schema( {
  userId: {type:Schema.Types.ObjectId, ref:'User'},
  name: String,
  email: String,
  phone: String,
  comments: String,
  //For some reason the comments section is in bold. I don't understand why.
} );

module.exports = mongoose.model( 'Contact', contactSchema );

