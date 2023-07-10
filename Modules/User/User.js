// STEP 1: Import required libraries
import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

// STEP 2: Implement dotenv configaration
dotenv.config()

// STEP 3: Define the UserShema
const UserSchema = new mongoose.Schema(
    {
        FirstName:{
            type:String,
            required:true,
            trim:true
        },
        LastName:{
            type:String,
            trim:true
        },
        Email:{
            type:String,
            required:true,
            trim:true,
            unique:true
        },
        Address:{
            type:String,
            trim:true
        },
        PinCode:{
            type:Number,
            required:true,
            trim:true
        },
        Nationality:{
            type:String,
            required:true,
            trim:true 
        },
        PhoneNumber:{
            type:Number,
            required:true,
            trim:true
        },
        Password:{
            type:String,
            required:true,
            trim:true
        },
        Photo:{
            data: Buffer,
            contentType: String
        }
    }
)


// STEP 4: Generate tha user token
export const GenerateUserToken = (id,expiresIn) => {
   return jwt.sign({id},process.env.SECRET_KEY,{expiresIn})
}

// STEP 5: Export the User model
export const User = mongoose.model("users",UserSchema)