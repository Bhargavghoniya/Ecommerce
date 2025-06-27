// import React from "react";

// const PayNow = () => {
//   const makePayment = async () => {
//     const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJoYXJnYXZnaG9uaXlhZ21haWwuY29tIiwiaWF0IjoxNzUwOTU2NTgyLCJleHAiOjE3ODI0OTI1ODJ9.5RSqU56n4UBLUs2WHv1Y67XJ_z0H3HEhREh1Ds7x_9w"; 

//     const res = await fetch("http://localhost:8080/cart/payment", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         token: token,
//       },
//     });

//     const data = await res.json();
//     if (!data.order) {
//       alert("Order creation failed");
//       return;
//     }

//     const options = {
//       key: data.key,
//       amount: data.order.amount,
//       currency: "INR",
//       name: "My Store",
//       description: "Cart Purchase",
//       order_id: data.order.id,
//       handler: function (response) {
//         alert("Payment successful: " + response.razorpay_payment_id);
//       },
//       theme: {
//         color: "#3399cc",
//       },
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   };

//   return <button onClick={makePayment}>Pay Now</button>;
// };

// export default PayNow;
