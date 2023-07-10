// STEP 1: Import required libraries
import express from "express";
import bcrypt from "bcrypt";
import { Admin } from "../../../Modules/Admin/Admin.js";
import multer from "multer";
import sharp from "sharp";



// STEP 2: Define Router
const Router = express.Router();

// Validate file mimetype to accept only images
const imageFileFilter = (request, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only image files are allowed "));
  }
};

// Define uploadSingle using multer
const uploadSingle = multer({ fileFilter: imageFileFilter });

// STEP 3: Crete router for edit profile photo
Router.put(
  "/edit/profilephoto/:id",
  uploadSingle.single("photo"),
  async (request, response) => {
    try {
      // Step 1: Verify if the admin is exist
      const admin = await Admin.findById(request.params.id);

      // Step 2: Send response with status 400 if the admin is not exist
      if (!admin) {
        return response.status(400).json({ message: "Admin not found" });
      }

      // Step 3: Define photoFile
      const photoFile = await sharp(request.file.buffer).jpeg({quality:90}).resize(800,600).toBuffer();

      // Step 4: Define photo
      const Photo = {
        data: photoFile,
        contentType: '/image/jpeg',
      };

      // Step 5: Reset profile details in database
      await Admin.findByIdAndUpdate(
        { _id: request.params.id },
        {
          $set: {
            Photo,
          },
        },
        { new: true }
      );

      // Step 4: Send response with status 200 if the process is done successfully
      response
        .status(200)
        .json({ message: "Profile photo changed successfully" });
    } catch (error) {
      // Step 6: Send response with status 500 if the server is facing any error
      console.log(error);
      response.status(500).json({ message: "Internal server problem" });
    }
  }
);

// STEP 4: Create router for edit profile except password and photo
Router.put("/edit/:id", async (request, response) => {
  try {
    // Step 1: Verify if the admin is exist
    const admin = await Admin.findById(request.params.id);

    // Step 2: Send response with status 400 if the admin is not exist
    if (!admin) {
      return response.status(400).json({ message: "Admin already exist" });
    }

    // Step 3: Define required details
    const {
      FirstName,
      LastName,
      Email,
      Address,
      PinCode,
      Nationality,
      PhoneNumber,
    } = request.body;

    // Step 4: Check if admin provided email already exist
    const existadmin = await Admin.findOne({ Email });

    // Step 5: Send response with status 400 if the admin is already exist
    if (existadmin) {
      return response.status(400).json({ message: "Admin mail already exist" });
    }

    // Step 6: Reset profile details in database
    await Admin.findByIdAndUpdate(
      { _id: request.params.id },
      {
        $set: {
          FirstName,
          LastName,
          Email,
          Address,
          PinCode,
          Nationality,
          PhoneNumber,
        },
      },
      { new: true }
    );

    // Step 4: Send response with status 200 if the process is done successfully
    response.status(200).json({ message: "Profile changed successfully" });
  } catch (error) {
    // Step 7: Send response with status 500 if the server is facing any error
    console.log(error);
    response.status(500).json({ message: "Internal server problem" });
  }
});

// STEP 4: Create router for changing password
Router.put("/changepassword/:id", async (request, response) => {
  try {
    // Step 1: Verify if the old password is correct or wrong
    const admin = await Admin.findById(request.params.id);
    if (!admin) {
      return response.status(400).json({ message: "Admin not found" });
    }
    
    const oldPasswordMatch = await bcrypt.compare(
      request.body.OldPassword,
      admin.Password
    );
    
    if (!oldPasswordMatch) {
      return response.status(400).json({ message: "Old password is wrong" });
    }
    
    // Step 2: Generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(request.body.NewPassword, salt);

    // Step 3: Change password
    await Admin.findByIdAndUpdate(
      { _id: request.params.id },
      {
        $set: {
          Password: hashedPassword,
        },
      },
      { new: true }
    );

    // Step 4: Send response with status 200 if the process is done successfully
    response.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    // Step 5: Send response with status 500 if the server is facing any error
    console.log(error);
    response.status(500).json({ message: "Internal server problem" });
  }
});

export const adminProfileRouter = Router;