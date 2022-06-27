'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var scheduleSchema = Schema( {
  userId: {type:Schema.Types.ObjectId, ref:'User'},
  courseId: {type:Schema.Types.ObjectId,ref:'Spell'},
} );

module.exports = mongoose.model( 'Spell_List', scheduleSchema );

