
require('dotenv').config();
const nodemailer = require('nodemailer')
const Feedback = require('../../models/feedbackModel');

const feedback ={
sendEmail:async (req,res,next) => {
    try {
        const {name,email,subject,message}=req.body

        const feedbacks = new Feedback({
            name,
            email,
            subject,
            message
        })
        await feedbacks.save()


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SEND_EMAIL,
                pass: process.env.SEND_EMAIL_PASSWORD
            }
        })

        const mailOptions={
            from:email,
            to:process.env.SEND_EMAIL,
             subject: `Contact Form: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`
        }

        await transporter.sendMail(mailOptions);
        
       return  res.status(200).json({ success: true, message: 'Message sent & saved!' })

    } catch (error) {
        next(error)
    }
}

}
module.exports=feedback