// STEP 1: Import required libraries
import express from 'express'
import { Product } from '../../../Modules/Common/Product.js';


// STEP 2: Define router
const Router = express.Router()

// STEP 3: Create router to add review and rating
Router.put("/review",async(request,response)=>{
    try {
        // Define customerid and productid
        const {CustomerId,ProductId,Review,ProductRating} = request.body;

        // Send an error response if the user doent provide a rating
        if(!ProductRating) return response.status(400).json({message:"Rating is mandotary"})
        // Find product
        const product = await Product.findById(ProductId)

        // Define review array
        const review = [...product.ProductReview,{CustomerId,Review,ProductRating}]
        
        // Add review to product
        const update = await Product.findByIdAndUpdate(
            ProductId,
            {$set:{
                ProductReview:review
            }},
            {new:true}
        )

        // Send an error response if there is an error in the update review process
        if(!update) return response.status(400).json({message:"Something went wrong"})

        // Send success response if all process done successfully
        response.status(200).json({message:"Your review successfully added"})
    } catch (error) {
        console.log(error)
        response.status(500).json({message:"Internal server problem"})
    }
})

// Define and export user product router
export const UserProductRouter = Router 