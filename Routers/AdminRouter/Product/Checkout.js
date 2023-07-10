// STEP 1: Import required libraries
import express from "express";
import { Checkout } from "../../../Modules/User/Checkout.js";
import { OTP } from "../../../Modules/Common/Otp.js";
import { User } from "../../../Modules/User/User.js";
import sendMail, { OTPNumber } from "../../../EmailProcess/EmailScript.js";

// STEP 2: Define router
const Router = express.Router();

// STEP 3: Send OTP to user to deliver the product
Router.post("/gendeliveryotp/:id", async (request, response) => {
  try {
    // Define id
    const id = request.params.id;

    // Find product
    const product = await Checkout.findById(id);

    // Find user
    const user = await User.findById(product.CustomerId);
    // Generat OTP
    const OTPnumber = OTPNumber();

    // Add new OTP if the admin is exist
    await new OTP({
      Type: "login",
      Email: user.Email,
      OTP: OTPnumber,
    }).save();

    // Send mail to admin
    const mail = sendMail(OTPnumber, user.Email, "OTP For Delivery");

    // Send an error response if any errors occur during send mail
    if (mail === "Error sending mail")
      return response.status(400).json({ message: "Error sending mai" });

    // Send respons.status(200) if all prooces done successfully
    response.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal server problem" });
  }
});

// STEP 4: Create router to update product satge
Router.put("/productstage/:id", async (request, response) => {
  try {
    //  Define id and product satge
    const id = request.params.id;
    const OrderStage = request.body.OrderStage

    // Check if that product is ordered
    const checkoutProduct = await Checkout.findById(id)

    if(checkoutProduct.CheckoutStatus !== "Ordered") return response.status(400).json({message:"Product not ordered"})

    // Update Order stage
    const update = await Checkout.findByIdAndUpdate(
      id,
      {
        $set: {
          OrderStage
        },
      },
      { new: true }
    );

    
    // Send an error response if any errors occur during the update proess
    if (!update)
      return response.status(400).json({ message: "Something went wrong" });

    // Send success response if all process done successfully
    response.status(200).json({ message: "Product stage updated successfully" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal server problem" });
  }
});

// STEP 5: Create router to deliver product
Router.put("/deliver/:id", async (request, response) => {
  try {
    //  Define id
    const id = request.params.id;

    // Define OTP
    const OTPnumber = request.body.OTP

    // Check if OTP is correct or wrong
    const verfication = await OTP.findOne({OTP:OTPnumber}) 

    // Send an error response if OTP is wrong
    if(!verfication) return response.status(400).json({message:"Wrong OTP"})

    
    // Update the checkout status to delivered
    const update = await Checkout.findByIdAndUpdate(
      id,
      {
        $set: {
          CheckoutStatus:"Delivered",
          OrderStage:"Delivered",
          DeliveredDate:Date.now()
        },
      },
      { new: true }
    );

    

    // Send an error response if any errors occur during the update proess
    if (!update)
      return response.status(400).json({ message: "Something went wrong" });

    // Send success response if all process done successfully
    response.status(200).json({ message: "Product delivered successfully" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal server problem" });
  }
});

// Create router to get all checkout products
Router.get("/", async (request, response) => {
  try {
    // Find all checkout products
    const products = await Checkout.find();

    // Send an error response if the products cannot be found
    if (!products)
      return response.status(400).json({ message: "Something went wrong" });

    // Send success response if all process done successfully
    response.status(200).json(products);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal server problem" });
  }
});

// STEP 6: Define and export AdminCheckoutRouter
export const AdminCheckoutRouter = Router;
