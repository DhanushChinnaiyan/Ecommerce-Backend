// STEP 1: Import required libraries
import express from 'express'
import bcrypt from 'bcrypt'
import { Admin, GenerateAdminToken } from '../../../Modules/Admin/Admin.js'
import { OTP } from '../../../Modules/Common/Otp.js'
import sendMail, { OTPNumber } from '../../../EmailProcess/EmailScript.js'

// STEP 2: Define the Route
const Router = express.Router()

// STEP 3: Create the routers

// Create the signup router for admin
Router.post("/signup",async(request,response)=>{
    try {
        // Step 1: Check if admin is already exists
        const admin = await Admin.findOne({Email:request.body.Email})

        // Step 2: Send response.status(400) if admin already exist
        if(admin) return response.status(400).json({message:"Admin already exist"})

        // Step 3: Create hashed password using bcrypt
           const salt = await bcrypt.genSalt(10)
           const hashedPassword = await bcrypt.hash(request.body.Password,salt)

        // Step 4: Add new admin if admin doesn't exist  
           await new Admin(
            {
                FirstName:request.body.FirstName,
                LastName:request.body.LastName,
                Email:request.body.Email,
                Address:request.body.Address,
                PinCode:request.body.PinCode,
                Nationality:request.body.Nationality,
                PhoneNumber:request.body.PhoneNumber,
                Password:hashedPassword
            }
        ).save() 

        const adminDetails = {
                FirstName:request.body.FirstName,
                LastName:request.body.LastName,
                Email:request.body.Email,
                Address:request.body.Address,
                PinCode:request.body.PinCode,
                Nationality:request.body.Nationality,
                PhoneNumber:request.body.PhoneNumber,
        }

        // Step 5: Send respons.status(200) if all prooces done successfully
        response.status(200).json({message:"Admin registered successfully",adminDetails})

    } catch (error) {
        // Step 6: Send response status(500) if server facing any error
        response.status(500).json({message:"Internal server problem"})
        console.log(error)
    }
})

// Create the login router for admin
Router.post("/login",async(request,response)=>{
    try {
         // Step 1: Check if admin is exists
         const admin = await Admin.findOne({Email:request.body.Email})

         // Step 2: Send response.status(400) if admin doesn't exist 
         if(!admin) return response.status(400).json({message:"Wrong admin email or password"})

         // Step 3: Check if the password is correct
         const verifyPassword = await bcrypt.compare(request.body.Password,admin.Password)

         // Step 4: Send response status(400) if password is wrong 
         if(!verifyPassword) return response.status(400).json({message:"Wrong admin email or password"})

         // Step 5: Generate jwt token if password is correct
          const token = GenerateAdminToken(admin._id,"3d")
          
         // Step 6: Send respons.status(200) if all prooces done successfully
         response.status(200).json({message:"Admin logedIn successfully",adminToken:token})
         
    } catch (error) {
        // Step 7: Send response status(500) if server facing any error
        response.status(500).json({message:"Internal server problem"})
        console.log(error)
    }
})

// Login using OTP
// Step 1: Create OTP and send it to admin
Router.post("/genloginotp",async(request,response)=>{
    try {
    // Step 1: Check if admin is exists
    const admin = await Admin.findOne({Email:request.body.Email})

    // Step 2: Send response.status(400) if admin doesn't already exist
    if(!admin) return response.status(400).json({message:"Admin not valid"})

    // Step 3: Generat OTP
    const Otp = OTPNumber() 

    // Step 4: Add new OTP if the admin is exist 
    await new OTP(
        {
            Type:"login",
            Email:request.body.Email, 
            OTP:Otp
        }
    ).save()

    // Step 5: Send mail to admin
    sendMail(Otp,request.body.Email,"OTP For Login")

    // Step 6: Send respons.status(200) if all prooces done successfully
     response.status(200).json({message:"Email sent successfully"})

    } catch (error) {
    // Step 7: Send response status(500) if server facing any error
    response.status(500).json({message:"Internal server problem"})
    console.log(error)
    }
})

// Step 2: Verify OTP
Router.post("/verifyloginotp",async(request,response)=>{
    try {
    // Step 1: Check if OTP is exists
    const admin = await OTP.findOne({Type:"login",Email:request.body.Email,OTP:request.body.OTP})

    // Step 2: Send response.status(400) if OTP doesn't exist
    if(!admin) return response.status(400).json({message:"Wrong OTP"})

    // Step 5: Generate jwt token if OTP is correct
    const token = GenerateAdminToken(admin._id,"3d")

    // Step 3: Send respons.status(200) if all prooces done successfully
     response.status(200).json({message:"Admin logedIn successfully",adminToken:token})

    } catch (error) {
    // Step 4: Send response status(500) if server facing any error
    response.status(500).json({message:"Internal server problem"})
    console.log(error)
    }
})


// Create the forgot password router
    // Step 1: Create OTP and send it to admin
    Router.post("/genotp",async(request,response)=>{
        try {
        // Step 1: Check if admin is already exists
        const admin = await Admin.findOne({Email:request.body.Email})

        // Step 2: Send response.status(400) if admin doesn't already exist
        if(!admin) return response.status(400).json({message:"Admin not valid"})

        // Step 3: Generat OTP
        const Otp = OTPNumber() 
        
        // Step 4: Add new OTP if the admin is exist 
        await new OTP(
            {
                Type:"resetPassword",
                Email:request.body.Email, 
                OTP:Otp
            }
        ).save()

        // Step 5: Send mail to admin
        sendMail(Otp,request.body.Email,"Reset Your Password")

        // Step 6: Send respons.status(200) if all prooces done successfully
         response.status(200).json({message:"Email sent successfully"})

        } catch (error) {
        // Step 7: Send response status(500) if server facing any error
        response.status(500).json({message:"Internal server problem"})
        console.log(error)
        }
    })
    // Step 2: Verify OTP
    Router.post("/verifyotp",async(request,response)=>{
        try {
        // Step 1: Check if OTP is exists
        const Otp = await OTP.findOne({Type:"resetPassword",Email:request.body.Email,OTP:request.body.OTP})

        // Step 2: Send response.status(400) if OTP doesn't exist
        if(!Otp) return response.status(400).json({message:"Wrong OTP"})
        
        // Step 3: Send respons.status(200) if all prooces done successfully
         response.status(200).json({message:"You can reset your password now"})

        } catch (error) {
        // Step 4: Send response status(500) if server facing any error
        response.status(500).json({message:"Internal server problem"})
        console.log(error)
        }
    })
    // Step 3: Change password
    Router.put("/resetpassword",async(request,response)=>{
        try {
        // Step 1: Generate hashed password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(request.body.Password,salt)

        // Step 2: Change password
        await Admin.findOneAndUpdate(
            {Email:request.body.Email},
            {$set:{
                Password:hashedPassword
            }},
            {new:true}
        )

        // Step 3: Send respons.status(200) if all prooces done successfully
         response.status(200).json({message:"Password changed successfully"})

        } catch (error) {
        // Step 4: Send response status(500) if server facing any error
        response.status(500).json({message:"Internal server problem"})
        console.log(error)
        }
    })
    

export const adminRouter = Router