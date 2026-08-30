const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        skills: {
            type: [String],
            required: true
        },

        experience: {
            type: Number,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        hourlyRate: {
            type: Number,
            required: true
        },

        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Worker", workerSchema);