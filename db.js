import mongoose from "mongoose";
import dotenv from "dotenv";

// Dotenv configuration
dotenv.config();

const DataBaseConnection = () => {
  const params = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.connect(process.env.MONGODB_URL, params);
    console.log("MongoDb successfully connected");
  } catch (error) {
    console.log("An error occurred connecting to MongoDB");
  }
};

export default DataBaseConnection;
