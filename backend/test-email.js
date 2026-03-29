require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('--- SMTP Debug Test ---');
  console.log(`Email: ${process.env.EMAIL_FROM_ADDRESS}`);
  console.log(`Pass:  ${process.env.EMAIL_APP_PASSWORD ? '********' : 'MISSING'}`);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_FROM_ADDRESS,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    debug: true, // Show detailed SMTP traffic
    logger: true, // Log everything to console
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection is verified and ready!');
    
    console.log('Sending test email...');
    await transporter.sendMail({
      from: process.env.EMAIL_FROM_ADDRESS,
      to: process.env.EMAIL_FROM_ADDRESS, // Send to self
      subject: 'Expensio SMTP Test',
      text: 'If you see this, your Gmail App Password is working!',
    });
    console.log('✅ Test email sent successfully!');
  } catch (err) {
    console.error('❌ SMTP Error Detail:');
    console.error(err);
    
    if (err.message.includes('BadCredentials')) {
      console.log('\n--- DIAGNOSIS ---');
      console.log('Gmail rejected your credentials.');
      console.log('1. Ensure 2-Step Verification is ON.');
      console.log('2. Ensure you are using a 16-character "App Password", NOT your main login password.');
      console.log('3. Double-check for typos or extra spaces in your .env file.');
    }
  }
}

testSMTP();
