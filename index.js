// STEP 1: Import required libraries
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import DataBaseConnection from './db.js'
import { KeywordRouter } from './Routers/UserRouter/Keyword/KeyWord.js'
import { CommonRouter } from './Routers/CommonRouter/Common.js'
import { userRouter } from './Routers/UserRouter/UserEntry/User.js'
import { UserProfileRouter } from './Routers/UserRouter/Profile/Profile.js'
import { RecentProductRouter } from './Routers/UserRouter/RecentlyViewedProduct/RecentlyViewedProducts.js'
import { UserProductRouter } from './Routers/UserRouter/Product/Product.js'
import { CheckoutRouter } from './Routers/UserRouter/Product/Checkout.js'
import { adminRouter } from './Routers/AdminRouter/AdminEntry/Admin.js'
import AdminAuthorization from './Controllers/AdminAuthorization.js'
import { adminProfileRouter } from './Routers/AdminRouter/Profile/Admin.js'
import { ProductRouter } from './Routers/AdminRouter/Product/Product.js'
import { AdminCheckoutRouter } from './Routers/AdminRouter/Product/Checkout.js'
import { AdminKeywordRouter } from './Routers/AdminRouter/Keyword/Keyword.js'
import { adminCommonRouter } from './Routers/AdminRouter/Common.js'
import UserAuthorization from './Controllers/UserAuthoriZation.js'
import { Product } from './Modules/Common/Product.js'
import { Base64 } from 'js-base64'
import CryptoJS from 'crypto-js'


// STEP 2: Connect MongoDB
DataBaseConnection()

// STEP 3: Define app
const app = express()

// STEP 2: Dotenv configuration
dotenv.config()

// STEP 3: Create middlewares
app.use(express.json())
app.use(cors())

// STEP 4: Use routers
// Common routers
app.use("/common",CommonRouter)  // Can be used by both admin and user


// User Routers
app.use("/userentry",userRouter) // User entry router
app.use("/userprofile",UserAuthorization,UserProfileRouter) // User profile router
app.use("/keyword",KeywordRouter) // keyword router
app.use("/recentproduct",RecentProductRouter) // Recent product router 
app.use("/userproduct",UserAuthorization,UserProductRouter) // Review and Rating router
app.use("/checkout",UserAuthorization,CheckoutRouter) // Checkout router

// Admin Routers
app.use("/adminentry",adminRouter) // Admin entry router
app.use("/adminprofile",AdminAuthorization,adminProfileRouter) // Admin profile router
app.use("/product",AdminAuthorization,ProductRouter)  // Product router
app.use("/admincheckout",AdminAuthorization,AdminCheckoutRouter) // Checkout router
app.use("/adminkeywords",AdminAuthorization,AdminKeywordRouter) //keyword router
app.use("/admincommon",AdminAuthorization,adminCommonRouter) // common router for admin

app.get("/",async(request,response)=>{
    const products = await Product.find()
    response.status(200).json(products)
})

// secured url verification
app.get('/urlverification', (req, res) => {
    const URLToken = req.query.token;
    const value = req.query.value;
    const timestamp = req.query.timestamp;
  
    try {
        const Token = "NTA0M2YwNzYxYTQ0OGRjYjljM2VkZGZlYmQ0ZWI2NTgzMThjMDc1ODgxYjZmYTRjYmEwMTQ2ODNmMmNmYWEyMg";
      // Decode the URLToken
      const decodedHash = Base64.decode(URLToken);
  
      // Recreate the combinedString
      const combinedString = `${Token}:${timestamp}`;
  
      // Hash the new combinedString using the same cryptographic hash function
      const hashedString = CryptoJS.SHA256(combinedString).toString();

      // Compare the new hash with the decodedHash
      if (hashedString !== decodedHash) {
        return res.status(400).json({ message: 'Invalid URL' });
      }
  
      // Verify the timestamp if needed
      const currentTimestamp = Date.now();
      if (parseInt(timestamp, 10) < currentTimestamp) {
        return res.status(400).json({ message: 'URL has expired' });
      }
  
      // If everything is valid, proceed with the password reset process
      // ...
  
      return res.status(200).json({ message: 'URL verified' });
    } catch (error) {
        console.log(error)
      return res.status(400).json({ message: 'Internal server problem' });
    }
  })
// STEP 5: Create local host listening port
app.listen(process.env.PORT)