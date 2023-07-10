// STEP 1: Import required libraries
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'

// STEP 2: Dotenv configuration
dotenv.config()

// STEP 3: Create OTP number generator
export const OTPNumber = () => {
    const lenght = 6;
    let OTP = "";
    for(let index=0; index<lenght; index++){
       OTP += Math.floor(Math.random()*9)
    }
    return parseInt(OTP)
}

// STEP 4: Create sendMail function
const sendMail = (OTP, useremail, messagesubject) => {
  // Step 1: Configure transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  // Step 2: Email text
  const mailtext = `Your OTP - ${OTP}, Your One-Time Password (OTP) Expires in 5 Minutes`;

  // Step 3: Define mail options
  const mailOptions = {
    from: process.env.EMAIL,
    to: useremail,
    subject: messagesubject,
    text: mailtext,
  };

  // Step 4: Send email
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log('Mail error:', err);
      return "Error sending mail"
    } else {
      console.log('Email has been sent');
      return "Email has been sent"
    }
  });
};

// STEP 5: ExportsendMail function
export default sendMail;