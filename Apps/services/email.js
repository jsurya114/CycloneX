const nodemailer = require('nodemailer')
// Configure Nodemailer with correct SMTP settings
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Use 587 if 465 doesn't work
    secure: true,
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASSWORD 
    }
});

// Generate a random 6-digit OTP

// Function to send email
const sendEmail = async (to, subject, htmlContent) => {
    try {
        let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            html: htmlContent
        });
        console.log("✅ Email sent successfully:", info.response);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};
module.exports = sendEmail
