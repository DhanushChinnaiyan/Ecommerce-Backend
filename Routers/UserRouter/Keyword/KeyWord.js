// STEP 1: Import required libraries
import express from 'express'
import { KeyWord } from '../../../Modules/User/KeyWord.js'


// STEP 2: Define Router
const Router = express.Router()

// STEP 3: Create a router to add key words from searches
Router.post("/add/:id",async(request,response)=>{
    try {
        // Define body an id
        const Keyword = request.body.KeyWord
        const id = request.params.id

        //  Check if keyword is already exist
        const keyWord = await KeyWord.findOne({KeyWord:Keyword})

        
        if(keyWord){

            let SearchCount 
            // Find user
            const user = keyWord.SearchCount.filter((user)=> user.CustomerId == id && user.Type === "Searched")
      
            // Increase search count if it is already exist
            if(user.length>0){
                 SearchCount = keyWord.SearchCount.map((customer)=>{
                     if(customer.CustomerId == id && customer.Type === "Searched"){
                         const count = customer.Count + 1
                         return {
                             Count:count,
                             CustomerId:customer.CustomerId,     
                         }
                     }else{
                         return customer
                     }
                 })
            } else {
                SearchCount = [...keyWord.SearchCount,{CustomerId:id}]
            }
            
            const update = await KeyWord.findOneAndUpdate(
                {KeyWord:Keyword},
                {$set:{
                    SearchCount
                }}
            )

            // Send status 400 response if udate is not sucessfull
          if(!update)  return response.status(400).json({message:"Something went wrong"})
        // Send success response if all process done successfully
       return response.status(200).json({message:"Keyword added successfully"})
        }
        
        const SearchCount = [{
            CustomerId:id
        }]
        
        // Add new keyword
        const newKeyWord = await new KeyWord(
            {
                KeyWord:Keyword,
                SearchCount
            }
        ).save()

        // Send status 400 response if key word is not added sucessfull
        if(!newKeyWord) return response.status(400).json({message:"Something went wrong"})

        // Send success response if all process done successfully
        response.status(200).json({message:"Keyword added successfully"})
    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: "Internal server error" });
    }
})

// STEP 4: Create router to get keywords
Router.get('/getkeywords/:userId', async (request, response) => {
    try {
      const userId = request.params.userId;
  
      // Find keywords by user id
      const keywords = await KeyWord.find({
        'SearchCount.CustomerId': userId
      }).distinct('KeyWord');
  
      response.status(200).json({ Keywords: keywords });
    } catch (error) {
      console.log(error);
      response.status(500).json({ message: 'Internal server error' });
    }
  })

// STEP 5: Define and export keyword router
export const KeywordRouter = Router