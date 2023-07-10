// STEP 1: Import required libraries
import express from "express";
import bcrypt from "bcrypt";
import { User } from "../../../Modules/User/User.js";
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
      // Step 1: Verify if the user is exist
      const user = await User.findById(request.params.id);

      // Step 2: Send response with status 400 if the user is not exist
      if (!user) {
        return response.status(400).json({ message: "User not found" });
      }

      // Step 3: Define photoFile
      const photoFile = await sharp(request.file.buffer).jpeg({quality:90}).resize(800,600).toBuffer();

      // Step 4: Define photo
      const Photo = {
        data: photoFile,
        contentType: '/image/jpeg',
      };

      // Step 5: Reset profile details in database
      await User.findByIdAndUpdate(
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
    // Step 1: Verify if the user is exist
    const user = await User.findById(request.params.id);

    // Step 2: Send response with status 400 if the user is not exist
    if (!user) {
      return response.status(400).json({ message: "User already exist" });
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

    // Step 4: Check if user provided email already exist
    const existUser = await User.findOne({ Email });

    // Step 5: Send response with status 400 if the user is already exist
    if (existUser) {
      return response.status(400).json({ message: "User mail already exist" });
    }

    // Step 6: Reset profile details in database
    await User.findByIdAndUpdate(
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
    const user = await User.findById(request.params.id);
    if (!user) {
      return response.status(400).json({ message: "User not found" });
    }

    const oldPasswordMatch = await bcrypt.compare(
      request.body.OldPassword,
      user.Password
    );

    if (!oldPasswordMatch) {
      return response.status(400).json({ message: "Old password is wrong" });
    }

    // Step 2: Generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(request.body.NewPassword, salt);

    // Step 3: Change password
    await User.findByIdAndUpdate(
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

export const UserProfileRouter = Router;
