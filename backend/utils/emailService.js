const { Resend } = require('resend');

// Use a placeholder if not provided in env
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789'); 

/**
 * Sends a post-payment invoice email.
 * @param {Object} data 
 * @param {string} data.toEmail - User's email
 * @param {string} data.invoiceNumber - Transaction ID or Order ID
 * @param {string} data.planName - Name of the plan purchased
 * @param {number} data.price - Price of the plan
 * @param {Date} data.billingDate - Current date
 * @param {Date} data.nextRenewalDate - Renewal date
 * @param {string} data.paymentMethod - e.g., 'Razorpay'
 */
async function sendInvoiceEmail({ toEmail, invoiceNumber, planName, price, billingDate, nextRenewalDate, paymentMethod }) {
  try {
    const htmlContent = `
      <h1>Invoice: ${invoiceNumber}</h1>
      <p>Thank you for subscribing to the <strong>${planName}</strong> plan.</p>
      <p><strong>Amount:</strong> ₹${price}</p>
      <p><strong>Billing Date:</strong> ${billingDate.toLocaleDateString()}</p>
      <p><strong>Next Renewal Date:</strong> ${nextRenewalDate.toLocaleDateString()}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p>Enjoy your premium features on our platform!</p>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Internshala Clone <noreply@yourdomain.com>',
      to: [toEmail],
      subject: `Invoice for your ${planName} Subscription`,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Invoice email sent successfully:', data);
    return true;
  } catch (err) {
    console.error('Exception in sendInvoiceEmail:', err);
    return false;
  }
}

module.exports = { sendInvoiceEmail };
