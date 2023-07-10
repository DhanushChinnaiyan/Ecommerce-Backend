// STEP 1: Import required libraries
import express from "express";
import multer from "multer";
import sharp from "sharp";
import { Product } from "../../../Modules/Common/Product.js";

// STEP 2: Define Router
const Router = express.Router();

// file mimetype to accept only images and video
const FileFilter = (request, file, cb) => {
  // Define the allowed files in image and video
  const allowedImageFiles = ["image/jpeg", "image/png"];

  // Check if the file is an image
  if (allowedImageFiles.includes(file.mimetype)) {
    cb(null, true);
  }
  // Invalid file type
  else {
    request.inValidFile = true;
    cb(null, false);
  }
};

// Define upload using multer
const upload = multer({ fileFilter: FileFilter });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STEP 3: Create a product add router
Router.post(
  "/add",
  upload.fields([{name:"images"}]),
  async (request, response) => {
    try {

      // Define image
      const images  = request.files.images;
      // Check if image file is uploaded or not
      if (!images)
        return response
          .status(400)
          .json({ message: "You need to upload minimum one image" });

      // Check if admin uploaded invalid file
      if (request.inValidFile)
        return response.status(400).json({
          message:
            "Invalid file type. Only images (JPEG/PNG) and an optional video (MP4/MPEG) are allowed.",
        });

      // Define required body elements
      const {
        ProductName,
        ProductSellingPrice,
        ProductTotalPrice,
        ProductDeliveryCharge,
        ProductCatagory,
        ProductSubCatagory,
        ProductBrand,
        ProductDescription,
        ProductsCount,
        ProductKeyWords,
        ProductReturnDays
      } = request.body;

      

      // Check if product images are more than 5
      if (images.length > 5)
        return response
          .status(400)
          .json({ message: "A maximum of five images are allowed" });

      // Check if product key word are more than 5
      if (ProductKeyWords.length > 5)
        return response
          .status(400)
          .json({ message: "A maximum of five keywords are allowed" });

      // Check if product key word is less than one
      if (ProductKeyWords.length < 1)
        return response
          .status(400)
          .json({ message: "You need to give minimum one key word" });

      // Define product ProductImage
      let ProductImage = [];
      // Push images to content array
      if (images) {
        for (const image of images) {
          const imageData = await sharp(image.buffer)
            .jpeg({ quality: 90 })
            .resize(800, 600)
            .toBuffer();

            ProductImage.push({
              data: imageData,
              contentType:"/image/jpeg",
          });
        }
      }

      const KeyWord = ProductKeyWords.map((keyWord) => ({
        KeyWord: keyWord,
      }));

      //   Calculat Discount
      const Discount = ProductTotalPrice - ProductSellingPrice;

      // Add new product to database
      await new Product({
        ProductImage,
        ProductName,
        ProductSellingPrice,
        ProductDiscountPrice: Discount,
        ProductTotalPrice,
        ProductDeliveryCharge,
        ProductCatagory,
        ProductSubCatagory,
        ProductBrand,
        ProductDescription,
        ProductsCount,
        ProductKeyWords: KeyWord,
        ProductReturnDays
      }).save();

      // return success response if all process done successfully
      response.status(200).json({ message: "Product added successfully" });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: "Internal server error" });
    }
  }
);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STEP 4: Create a product edit router
Router.put(
  "/edit/:id",
  upload.fields([{name:"images"}]),
  async (request, response) => {
    try {
       // Define image
       const images = request.files.images;

      // Check if product is exist
      const product = await Product.findById(request.params.id);

      // Send status 400 response if product is not found
      if (!product)
        return response.status(400).json({ message: "Product not found" });

      // Check if image file is uploaded or not
      if (!images)
        return response
          .status(400)
          .json({ message: "You need to upload minimum one image" });

      // Check if admin uploaded invalid file
      if (request.inValidFile)
        return response.status(400).json({
          message:
            "Invalid file type. Only images (JPEG/PNG) and an optional video (MP4/MPEG) are allowed.",
        });

      // Define required body elements
      const {
        ProductName,
        ProductSellingPrice,
        ProductTotalPrice,
        ProductDeliveryCharge,
        ProductCatagory,
        ProductSubCatagory,
        ProductBrand,
        ProductDescription,
        ProductKeyWords,
        ProductReturnDays
      } = request.body;

    

      // Check if product key word is less than one
      if (!ProductKeyWords)
        return response
          .status(400)
          .json({ message: "You need to give minimum one key word" });

      // Check if product images are more than 5
      if (images && images.length > 5)
        return response
          .status(400)
          .json({ message: "A maximum of five images are allowed" });

      // Check if product key word are more than 5
      if (ProductKeyWords && ProductKeyWords.length > 5)
        return response
          .status(400)
          .json({ message: "A maximum of five keywords are allowed" });

      // Push all images and video to ProductImage array
      const ProductImage = [];

      if (images) {
        for (const image of images) {
          const imageData = await sharp(image.buffer)
            .jpeg({ quality: 90 })
            .resize(800, 600)
            .toBuffer();
            ProductImage.push({
              data: imageData,
              contentType: "/image/jpeg",           
          });
        }
      }

      
      const KeyWord = [];
      if (ProductKeyWords) {
        for (const keyWord of ProductKeyWords) {
          KeyWord.push({
            KeyWord: keyWord,
          });
        }
      }

      //   Calculat Discount
      const Discount = ProductTotalPrice - ProductSellingPrice;

      // Add new product to database
      const updateproduct = await Product.findByIdAndUpdate(
        { _id: request.params.id },
        {
          $set: {
            ProductImage,
            ProductName,
            ProductSellingPrice,
            ProductDiscountPrice: Discount,
            ProductTotalPrice,
            ProductDeliveryCharge,
            ProductCatagory,
            ProductSubCatagory,
            ProductBrand,
            ProductDescription,
            ProductKeyWords: KeyWord,
            ProductReturnDays
          },
        },
        { new: true }
      );

      // Send status 400 response if there is any error finding and updating product
      if (!updateproduct)
        return response.status(400).json({ message: "Something went wrong" });

      // return success response if all process done successfully
      response.status(200).json({ message: "Product edited successfully" });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: "Internal server error" });
    }
  }
);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STEP 5: Create product delete router
Router.delete("/delete/:id",async(request,response)=>{
  try {
    // Find and delete product
    const productDeleted = await Product.findByIdAndDelete(request.params.id)  ;
    
    // Send status 400 response if product delete is not sucessfull
    if(!productDeleted) return response.status(400).json({message:"Something went wrong"})

    // Send success response if all process done successfully
    response.status(200).json({message:"Product deleted sucessfully"})
  } catch (error) {
      console.log(error);
      return response.status(500).json({ message: "Internal server error" });
  }
})

// STEP 7: Define and export product router
export const ProductRouter = Router;
