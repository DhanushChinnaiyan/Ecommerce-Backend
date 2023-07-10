// STEP 1: Import required libraries
import express from 'express';
import redis from 'redis';
import mongoose from 'mongoose';
import { Product } from '../../Modules/Common/Product.js';
import { KeyWord } from '../../Modules/User/KeyWord.js';


const {ObjectId} = mongoose.Types
// STEP 2: Create a Redis client
const redisClient = redis.createClient();

// STEP 3: Define router
const Router = express.Router();

// STEP 4: Create router to get all products
Router.get("/", async (request, response) => {
  try {
    // Check if the data is already in Redis
    redisClient.get("allProducts", async (error, cachedProducts) => {
      if (cachedProducts) {
        // If data exists in Redis, send the cached products
        return response.status(200).json(JSON.parse(cachedProducts));
      }

      // Get all products from the database
      const products = await Product.find();

      // Store the products in Redis for future requests
      redisClient.set("allProducts", JSON.stringify(products));

      // Send products as a response
      response.status(200).json(products);
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal server error" });
  }
});

// STEP 5: Create router to increase the views count of the product when user clicks product
Router.put("/increaseviews",async(request,response)=>{
    try {
      // Define customerid, Keyword and productId
      const CustomerId = request.headers["customerid"]
      const ProductId = request.headers["productid"]
      const keywords = request.body.keywords

      // Get product details
      const product = await Product.findById(ProductId)
      
      // Define Count
      const ProductsCount = []

      // Push all views ount to productiewount array
      product.ProductViewCount.map((views)=>{
        if(!new ObjectId(views.CustomerId).equals(CustomerId)){
          ProductsCount.push(views)
        }      
      })

      // Check if user already clicked this product
      const userViewCount = product.ProductViewCount
      .map((views)=>{if(new ObjectId(views.CustomerId).equals(CustomerId)) return views})
  
      if(userViewCount.length>0){
        userViewCount[0].Counts.push({ Views: 1 });
        ProductsCount.push(userViewCount[0]);
      } else {
        ProductsCount.push({
          Counts:[{
            Views:1
          }],
          CustomerId:CustomerId
        })

      }
     const update =  await Product.findByIdAndUpdate(
        ProductId,
        {$set:{
          ProductViewCount:ProductsCount
        }},
        {new:true}
       )

      //  Add product keyword when user clicks product
      
     keywords.map(async(keyword)=>{
      //  Check if keyword is already exist
       const ExistKeyword = await KeyWord.findOne({KeyWord:keyword})

       if(ExistKeyword){
        let SearchCount 
            // Find user
            const user = ExistKeyword.SearchCount.filter((user)=> user.CustomerId == CustomerId && user.Type === "Clicked")
      
            // Increase search count if it is already exist
            if(user.length>0){
                 SearchCount = ExistKeyword.SearchCount.map((customer)=>{
                     if(customer.CustomerId == CustomerId && customer.Type === "Clicked"){
                         const count = customer.Count + 1
                         return {
                             Count:count,
                             CustomerId:customer.CustomerId,   
                             Type:"Clicked"  
                         }
                     }else{
                         return customer
                     }
                 })
            } else {
                SearchCount = [...ExistKeyword.SearchCount,{CustomerId:CustomerId,Type:"Clicked"}]
            }
            
            await KeyWord.findOneAndUpdate(
                {KeyWord:keyword},
                {$set:{
                    SearchCount
                }}
            )
       } else {
       const SearchCount = [{
        CustomerId,
        Type:"Clicked"
    }]
    
    // Add new keyword
   await new KeyWord(
        {
            KeyWord:keyword,
            SearchCount
        }
    ).save()
      }

      })
    

       if(!update) return response.status(400).json({message:"Something went wrong"})
    
       // Send success response if all process done sucessfully
      response.status(200).json({message:"Successfully counts increased"})
    
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: "Internal server error" });
    }
})

// STEP 6: Define and export common router
export const CommonRouter = Router;
