const Note = require("../models/Note");
const colors = ["#ffe666", "#f5c27d", "#f6cebf", "#e3b7d2", "#bfe7f6"]; 

// ✅ Create a new note
exports.createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        //console.log("this is title ", title);

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        //console.log(req.user.id);

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newNote = new Note({
            user: req.user.userId, // Extracted from token in auth middleware
            title,
            content,
            color: randomColor,
        });

        await newNote.save();
        res.status(201).json({ message: "Note created successfully", note: newNote });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Get all notes for a logged-in user
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id ,  archived: false
        }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notes", error: error.message });
    }
};

// ✅ Delete a note by ID
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        if (note.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to delete this note" });
        }

        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting note", error: error.message });
    }
};

// ✅ Get all notes (for admin use, without authentication)
exports.getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find(  {user: req.user.userId}  ).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching all notes", error: error.message });
    }
};


// Search notes with enhanced query handling
exports.searchNotes = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { query } = req.query;
      
  //    console.log(`Search request from user ${userId} for query: "${query}"`);
  
      if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return res.status(400).json({ 
          success: false,
          message: "Valid search query (min 2 characters) is required" 
        });
      }
  
      const searchQuery = query.trim();
      const notes = await Note.find({
        user: userId,
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { content: { $regex: searchQuery, $options: "i" } }
        ]
      }).sort({ createdAt: -1 });
  
     // console.log(`Found ${notes.length} notes matching "${searchQuery}"`);
      
      res.status(200).json({ 
        success: true,
        count: notes.length,
        data: notes 
      });
    } catch (error) {
      handleError(res, error, "searching notes");
    }
  };


// ✅ Update an existing note by ID
exports.updateNote = async (req, res) => {
    try {
        const { title, content, color } = req.body;
        const noteId = req.params.id;

        let note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        // ✅ Ensure the note belongs to the logged-in user
        if (note.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to update this note" });
        }

        // ✅ Update the note fields
       note.title = title || note.title;
        note.content = content || note.content;
       // note.color = color || note.color;

        const updatedNote = await note.save();
        res.status(200).json({ message: "Note updated successfully", note: updatedNote });
    } catch (error) {
        res.status(500).json({ message: "Error updating note", error: error.message });
    }
};

// Archive a note
exports.archiveNote = async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
  
      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }
  
      if (note.user.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to archive this note",
        });
      }
  
      // Update the note's archived status
      const updatedNote = await Note.findByIdAndUpdate(
        req.params.id,
        { archived: true },
        { new: true }
      );
  
      return res.status(200).json({
        success: true,
        message: "Note archived successfully",
        data: updatedNote,
      });
  
    } catch (error) {
      console.error("Error archiving note:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while archiving note",
      });
    }
  };
  
  
  exports.getArchivedNotes = async (req, res) => {
    try {
      const archivedNotes = await Note.find({
        user: req.user.userId,
        archived: true,
      });
  
      res.status(200).json({
        success: true,
        data: archivedNotes,
      });
    } catch (error) {
      console.error("Error fetching archived notes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch archived notes",
      });
    }
  };

  exports.unarchiveNote = async (req, res) => {
    console.log("Unarchive route hit"); // Check if this prints

    try {
      const note = await Note.findById(req.params.id);
  
      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }
  
      if (note.user.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to unarchive this note",
        });
      }
  
      const updatedNote = await Note.findByIdAndUpdate(
        req.params.id,
        { archived: false },
        { new: true }
      );
  
      return res.status(200).json({
        success: true,
        message: "Note unarchived successfully",
        data: updatedNote,
      });
  
    } catch (error) {
      console.error("Error unarchiving note:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while unarchiving note",
      });
    }
  };
  