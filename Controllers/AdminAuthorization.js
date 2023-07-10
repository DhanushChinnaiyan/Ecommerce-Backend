// STEP 1: Import required libraries
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Admin } from "../Modules/Admin/Admin.js";


// STEP 2: Dotenv configuration
dotenv.config();

// STEP 3: Create admin authorization
const AdminAuthorization = async (request, response, next) => {
    try {
        // Step 1: Check if API has headers
        if (!request.headers) {
          return response.status(400).json({ message: "Access denied" });
        }
    
        // Step 2: Check if headers have admin JWT token
        const adminToken = request.headers["x-auth-admintoken"];
        if (!adminToken) {
          return response.status(400).json({ message: "Access denied" });
        }
    
        // Step 3: Verify JWT token
        const decodedToken = jwt.verify(adminToken, process.env.SECRET_KEY);
    
        // Step 4: Find admin by ID
        const admin = await Admin.findById(decodedToken.id).select("-Password");
        if (!admin) {
          return response.status(400).json({ message: "Invalid authorization" });
        }
    
        // Step 5: Add admin to the request object
        request.admin = admin;
    
        // Step 6: Call next middleware
        next();
      } catch (error) {
        // Step 7: Return invalid authorization response status if any error
        return response.status(400).json({ message: "Invalid authorization" });
      }
};

export default AdminAuthorization;
