// STEP 1: IMPORT REQUIRED LIBRARIES
import mongoose from "mongoose";

// STEP 2: DEFINE OBJECTID
const {ObjectId} = mongoose.Types

// STEP 3: DEFINE RECENTLY VIEWED PRODUCT SCHEMA
const RecentlyViewedProductSchema = new mongoose.Schema(
    {
        CustomerId:{
            type:ObjectId,
            ref:"users"
        },
        ProdutId:{
            type:ObjectId,
            ref:"products"
        },
        Date:{
            type:Date,
            default:Date.now
        }
    }
)

// STEP 4: DEFINE AND EXPORT RECENTLY VIEWED PRODUCT USING MONGOOSE MODEL
export const RecentlyViewedProduct = mongoose.model("recentlyviewedproducts",RecentlyViewedProductSchema)