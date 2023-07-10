// STEP 1: Import required libraries
import mongoose from "mongoose";

// STEP 2: Define ObjectId
const { ObjectId } = mongoose.Types;

// STEP 3: Define review schema
const ReviewSchema = new mongoose.Schema({
  Review: {
    type: String,
    trim: true,
  },
  ProductRating: Number,
  CustomerId: {
    type: ObjectId,
    ref: "users",
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

// STEP 4: Define count schema
const CountSchema = new mongoose.Schema({
  Views: {
    type: Number,
    default: 1,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

// STEP 5: Define view count schema
const ViewCountSchema = new mongoose.Schema({
  Counts: [CountSchema], // Storing multiple views for same user
  CustomerId: {
    type: ObjectId,
    ref: "users",
  },
});

// STEP 6: Define key word schema
const KeyWordSchema = new mongoose.Schema({
  KeyWord: String,
});

// STEP 7: Define image or video schema
const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
});

// STEP 8: Define product schema
const ProductSchema = new mongoose.Schema({
  ProductImage: [imageSchema],
  ProductName: {
    type: String,
    required: true,
    trim: true,
  },
  ProductSellingPrice: Number,
  ProductDiscountPrice: Number,
  ProductTotalPrice: Number,
  ProductDeliveryCharge: Number,
  ProductCatagory: {
    type: String,
    required: true,
    trim: true,
  },
  ProductSubCatagory: {
    type: String,
    required: true,
    trim: true,
  },
  ProductBrand: {
    type: String,
    required: true,
    trim: true,
  },
  ProductDescription: {
    type: String,
    required: true,
    trim: true,
  },
  ProductReview: [ReviewSchema], // Storing multiple reviews
  ProductViewCount: [ViewCountSchema], // Storing views count
  ProductsCount: Number,
  ProductKeyWords: [KeyWordSchema], // Storing koy word for product search
  ProductReturnDays:Number,
  Date: {
    type: Date,
    default: Date.now,
  }
});

// STEP 9: Define and export product using mongoose model
export const Product = mongoose.model("products", ProductSchema);
