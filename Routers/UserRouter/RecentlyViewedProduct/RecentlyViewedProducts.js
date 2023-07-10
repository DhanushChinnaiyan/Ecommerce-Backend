// STEP 1: Import required libraries
import express from 'express'
import { RecentlyViewedProduct } from '../../../Modules/User/RecentlyViewedProducts.js'

// STEP 2: Define router
const Router = express.Router()

// STEP 3: Create router to add recently viewed product
Router.post("/add",async(request,response)=>{
    try {
         // Define customerId and productid
         const {CustomerId,ProdutId} = request.body

        // Check if recently viewed product length is greater than 30
        const recentlyViewedProducts = await RecentlyViewedProduct.find({CustomerId})

        // Delete old product if length is greater than 30
        if(recentlyViewedProducts.length>=30){
            const deleteProduct = await RecentlyViewedProduct.findByIdAndDelete(recentlyViewedProducts[0]._id)
            if(!deleteProduct) return response.status(400).json({message:"Something went wrong"})
        }


        // Send error response if body didnt give
        if(!CustomerId || !ProdutId) return response.status(400).json({message:"Please give CustomerId and ProductId"})

        // Add new product if length is less than 30
        const newProduct = await new RecentlyViewedProduct(
            {
                CustomerId,
                ProdutId 
            }
        ).save()

        // Send an error response if the product addition process encounters any error
        if(!newProduct) return response.status(400).json({message:"Something went wrong"})

        // Send success respons if all process done successfully
        response.status(200).json({message:"Product added successfully"})
    } catch (error) {
       console.log(error)
       return response.status(500).json({message:"Internal server problem"})
    }
})

// STEP 3: Create router to get recently viewed product
Router.get("/get/:id",async(request,response)=>{
    try {
        // Define id
        const CustomerId = request.params.id

        // Get all recently viewed products
        const products = await RecentlyViewedProduct.find({CustomerId})

        // Send error response if any error occur in the product find process
        if(!products) return response.status(400).json(({message:"Something went wrong"}))
        
        // Send product if all process done successfully
        response.status(200).json(products)
    } catch (error) {
        console.log(error)
        return response.status(500).json({message:"Internal server problem"})
    }
})

// STEP 4: Define and export recently viewed product router
export const RecentProductRouter = Router