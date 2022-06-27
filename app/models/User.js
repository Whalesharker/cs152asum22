'use strict';
//Tells Javascript to be superstrict withe code here. No syntax errors allowed.
const mongoose = require( 'mongoose' );
//A mongoose object was already created in app.js, so it automatically uses that object
const Schema = mongoose.Schema;

var userSchema = Schema( {
  username: String,
  passphrase: String,
  age: String,
  email: String,
  photo: String,
} );

module.exports = mongoose.model( 'User', userSchema );
//This creates a mongoose model with the name 'User'. 
//By convention mongoose models are usually singular and capitalized.