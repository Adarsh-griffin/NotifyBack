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
        const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
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
        //console.log("user id ",req.user.userId)
        const notes = await Note.find(  {user: req.user.userId}  ).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching all notes", error: error.message });
    }
};


// ✅ Search notes
exports.searchNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Case-insensitive search in content and title
        const notes = await Note.find({
            user: userId,
            $or: [
                { content: { $regex: query, $options: "i" } },
                { title: { $regex: query, $options: "i" } }
            ]
        });

        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Error searching notes", error: error.message });
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

