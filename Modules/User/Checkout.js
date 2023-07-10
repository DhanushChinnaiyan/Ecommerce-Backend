// STEP 1: IMPORT REQUIRED LIBRARIES
import mongoose from "mongoose";

// STEP 2: DEFINE OBJECTID
const { ObjectId } = mongoose.Types;

// STEP 3: DEFINE CHECKOUT SCHEMA
const CheckoutSchema = new mongoose.Schema({
  CustomerId: {
    type: ObjectId,
    ref: "users",
  },
  ProdutId: {
    type: ObjectId,
    ref: "products",
  },
  ProductCount: Number,
  ProductPrice: Number,
  TotalPrice: Number,
  OrderStage: String,
  CheckoutStatus: String,
  CartAddedDate: {
    type: Date,
    default: Date.now,
  },
  CartRemovedDate: Date,
  OrderedDate: Date,
  OrderCanceledDate: Date,
  DeliveredDate: Date,
  ReturnedDate: Date,
});

// STEP 4: DEFINE AND EXPORT CHECKOUT USING MONGOOSE MODEL
export const Checkout = mongoose.model("checkout", CheckoutSchema);
