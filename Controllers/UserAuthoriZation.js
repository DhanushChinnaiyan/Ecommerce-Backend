// STEP 1: Import required libraries
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../Modules/User/User.js";

// STEP 2: Dotenv configuration
dotenv.config();

// STEP 3: Create user authorization
const UserAuthorization = async (request, response, next) => {
    try {
        // Step 1: Check if API has headers
        if (!request.headers) {
          return response.status(400).json({ message: "Access denied" });
        }
    
        // Step 2: Check if headers have user JWT token
        const userToken = request.headers["x-auth-usertoken"];
        if (!userToken) {
          return response.status(400).json({ message: "Access denied" });
        }
        
    
        // Step 3: Verify JWT token
        const decodedToken = jwt.verify(userToken, process.env.SECRET_KEY);
    
        // Step 4: Find user by ID
        const user = await User.findById(decodedToken.id).select("-Password");
        if (!user) {
          return response.status(400).json({ message: "Invalid authorization" });
        }
    
        // Step 5: Add user to the request object
        request.user = user;
    
        // Step 6: Call next middleware
        next();
      } catch (error) {
        // Step 7: Return invalid authorization response status if any error
        return response.status(400).json({ message: "Invalid authorization" });
      }
};

export default UserAuthorization;
