// STEP 1: Import required libraries
import mongoose from "mongoose";

// STEP 2: Define the OTPSchema with the TTL index cnfiguration
const OTPSchema = new mongoose.Schema({
    Type:{
        type:String,
        required:true,
        trim:true
    },
    Email:{
        type:String,
        required:true,
        trim:true
    },
    OTP:{
        type:Number,
        required:true,
        trim:true

    },
    Date:{
        type:Date,
        default:Date.now,
        expires: 300 // Expires after 300 seconds (5 minutes)
    }

})

// STEP 3: Create the TTL index for Date field using OTPSchema.index()
OTPSchema.index({ Date: 1 }, { expireAfterSeconds: 0 });

// STEP 4: Export the OTP model
export const OTP = mongoose.model("otps",OTPSchema)