// STEP 1: Import required libraries
import express from "express";
import { User } from "../../Modules/User/User.js";



// STEP 2: Define Router
const Router = express.Router();

// STEP 3: Create router to get all users
Router.get("/users",async(request,response)=>{
    try {
        const allUsers = await User.find({},{Password:0,Photo:0})
        response.status(200).json(allUsers)
    } catch (error) {
        console.log(error)
        response.status(500).json({message:"Internal server problem"})
    }
})

export const adminCommonRouter = Router;