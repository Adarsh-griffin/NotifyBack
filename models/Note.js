const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' , required :true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  color: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
});

module.exports = mongoose.model('Note', NoteSchema);
