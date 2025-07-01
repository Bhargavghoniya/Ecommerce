// const nodeEmailer = require('nodemailer');

// const sendEmail = async(userEmail,productArray) => {
// const transporter = nodeEmailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.NODE_EMAIL,
//         pass: process.env.NODE_PASSWORD
//     }
// })

// // prepare the product details in the text format
// const producDetails = productArray.map((product,index)=> {
//  `$(index + 1).Name: ${product.name}, Price: ${product.price}, Quantity: ${product.quantity}`

// })

// //setup mail content
// const mailOptions = {
//     from: process.env.NODE_EMAIL,
//     to: userEmail,
//     subject: 'Order Confirmation',
//     text: `Thank you for your order! Here are the details:\n\n${producDetails.join('\n')}\n\nWe will notify you once your order is shipped.`
// }
// try {
//     await transporter.sendMail(mailOptions);
//     console.log('Email sent successfully');
// }catch (error) {
//     console.error('Error sending email:', error);
// }
// }

// module.exports = sendEmail;





const nodeEmailer = require('nodemailer');

const sendEmail = async (userEmail, productArray) => {
  if (!userEmail) {
    console.error("No recipient email provided.");
    return;
  }

  const transporter = nodeEmailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODE_EMAIL,
      pass: process.env.NODE_PASSWORD
    }
  });

  //Properly return string from map
  const productDetails = productArray.map((product, index) => {
    return `${index + 1}. Name: ${product.name}, Price: ₹${product.price}, Quantity: ${product.quantity}`;
  });

  // Setup mail content
  const mailOptions = {
    from: process.env.NODE_EMAIL,
    to: userEmail, 
    subject: 'Order Confirmation',
    text: `Thank you for your order! Here are the details:\n\n${productDetails.join('\n')}\n\nWe will notify you once your order is shipped.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
