import mongoose from "mongoose";

const bookschema = mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
        },
        author:{
            type: String,
            requored: true,
        },
        publishyear:{
            type: Number,
            required: true,
        },
        image: {
            type: String,
            required: false,
        },
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true, 
        }
    },
    {
        timestamps: true,
    }
);
export const Book = mongoose.model('mybook', bookschema);