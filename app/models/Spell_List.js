'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var ListSchema = Schema( {
  userId: {type:Schema.Types.ObjectId, ref:'User'},
  //username: {String, ref:'username'},
  spellIndex: String,
  spellID: ObjectId,
} );

module.exports = mongoose.model( 'Spell_List', ListSchema );
