'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

var SpellSchema = Schema( {
    index: String,
    name: String,
    desc: String,
    higher_level: String,
    range: Mixed,
    components: String,
    material: String,
    ritual: Boolean,
    duration: Mixed,
    concentration: Boolean,
    casting_time: Mixed,
    level: Mixed,
    attack_type: String,
    damage_type: Mixed,
    //There are other fields but they are lists, I may have to implement them later.
    //https://www.dnd5eapi.co/api/spells/acid-arrow For reference to the fields.
} );

module.exports = mongoose.model( 'Spell', SpellSchema );
