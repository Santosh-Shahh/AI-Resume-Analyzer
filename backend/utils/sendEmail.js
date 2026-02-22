const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For production, you would use a real service like SendGrid, Mailgun, or AWS SES
    // For development, we can use Ethereal or just log to console if no credentials

    let transporter;

    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
    } else {
        // Fallback for development without SMTP
        console.log('⚠️  SMTP not configured. Mocking email send.');
        console.log(`📨  Email to: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: \n${options.message}\n`);
        console.log(`Message: \n${options.message}\n`);
        return false; // Indicating mock send
    }

    const message = {
        from: `${process.env.FROM_NAME || 'AI Resume Analyzer'} <${process.env.FROM_EMAIL || 'noreply@resumeparser.ai'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('⚠️  SMTP Send Failed (falling back to mock):', error.message);
        console.log('--- MOCK EMAIL FALLBACK ---');
        console.log(`📨  Email to: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: \n${options.message}\n`);
        console.log('---------------------------');
        return false;
    }
};

module.exports = sendEmail;
