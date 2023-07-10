// STEP 1: Import required libraries
import mongoose from "mongoose";


// STEP 2: Define search count schema
const SearchCountSchema = new mongoose.Schema(
    {
        Count : {
            type:Number,
            default:1
        },
        CustomerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
        },
        Type:{
            type:String,
            default:"Searched"
        },
        Date:{
            type:Date,
            default:Date.now
        }
    }
)

// STEP 3: Define key word schema
const KeyWordSchema = new mongoose.Schema(
    {
        KeyWord:{
            type:String,
            trim:true
        },
        SearchCount:[SearchCountSchema]

        
    }
)

// STEP 4: Define and export key word using mongoose model
export const KeyWord = mongoose.model("keywords",KeyWordSchema)