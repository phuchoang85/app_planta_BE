const mailer = require('nodemailer')
require('dotenv').config({path: '.env'});
const jwt = require('jsonwebtoken');
const {html} = require('../views/viewEmail')

const send = (mailOptions) =>{
    const transporter = mailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.user,
            pass: process.env.password
        }
    })

    transporter.sendMail(mailOptions);
}

const randomnum = () =>{
    const number = Math.floor(Math.random()*1000000).toString().padStart(6,'0')
    return number;
}


const createToken = (code, email) =>{
    const secretKey = process.env.secretKey;

    const token = jwt.sign({ email, code}, secretKey, { expiresIn: '1h' });

    return token
}

const verificationcodes = async (email) => {
    try {
        const code = randomnum();
        const token = createToken(code,email);
 
        // Thông tin về email gửi đi
        const mailOptions = {
            from: 'testhost@phqmarket.online',
            to: email,
            subject: 'verfication code',
            html: html(token,email)
        };
        // Gửi email
        setTimeout(  () =>{
            send(mailOptions)
        },0)
        
        return code
    } catch (error) {
        console.log(error)
        return null;
    }
}

module.exports = {verificationcodes}