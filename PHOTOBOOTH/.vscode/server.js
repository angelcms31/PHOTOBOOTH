// server.js - A simple Node.js server to handle email sending
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.static('public')); // Serve static files from 'public' directory
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for large image data

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service
  auth: {
    user: 'your-email@gmail.com', // Replace with your email
    pass: 'your-app-password' // Replace with your email password or app-specific password
  }
});

// API endpoint to handle email sending
app.post('/api/send-email', async (req, res) => {
  try {
    const { email, imageData, subject } = req.body;
    
    if (!email || !imageData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and image data are required' 
      });
    }

    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const attachmentBuffer = Buffer.from(base64Data, 'base64');

    // Email options
    const mailOptions = {
      from: 'your-email@gmail.com', // Replace with your email
      to: email,
      subject: subject || 'Your Photo Booth Pictures',
      text: 'Thank you for using our Photo Booth! Here are your pictures.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for using our Photo Booth!</h2>
          <p>Here are the pictures you took. We hope you had fun!</p>
          <p>Your photo strip is attached to this email.</p>
          <p>Best regards,<br>The Photo Booth Team</p>
        </div>
      `,
      attachments: [
        {
          filename: 'photo-strip.png',
          content: attachmentBuffer,
          encoding: 'base64'
        }
      ]
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send email' 
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});