// STEP 1: Import required libraries
import express from 'express';
import { KeyWord } from '../../../Modules/User/KeyWord.js';


// STEP 2: Define router
const Router = express.Router();

// STEP 3: Create router to get keywords
Router.get('/', async (request, response) => {
  try {
    // Find keywords 
    const keywords = await KeyWord.find()

    response.status(200).json(keywords);
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: 'Internal server error' });
  }
})

// STEP 4: Define and export common router
export const AdminKeywordRouter = Router;
