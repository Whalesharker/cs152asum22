'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var ListSchema = Schema( {
  userId: {type:Schema.Types.ObjectId, ref:'User'},
  //username: {String, ref:'username'},
  spellIndex: String,
} );

module.exports = mongoose.model( 'Spell_List', ListSchema );
