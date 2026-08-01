/**
 * Utility to check if the current time is within the allowed payment window.
 * The payment window is strictly between 10:00 AM and 11:00 AM IST (Asia/Kolkata).
 */
function isPaymentWindowActive(date = new Date()) {
  const nativeDate = new Date(date.valueOf());
  const options = {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(nativeDate);
  const hourPart = parts.find(p => p.type === 'hour');
  
  let hour = parseInt(hourPart.value, 10);
  if (hour === 24) hour = 0;

  if (hour === 10) {
    return true;
  }

  return false;
}

/**
 * Utility to check if the current time is within the allowed mobile login window.
 * The window is strictly between 10:00 AM and 1:00 PM (13:00) IST (Asia/Kolkata).
 */
function isMobileLoginWindowActive(date = new Date()) {
  const nativeDate = new Date(date.valueOf());
  const options = {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(nativeDate);
  const hourPart = parts.find(p => p.type === 'hour');
  
  let hour = parseInt(hourPart.value, 10);
  if (hour === 24) hour = 0;

  // Time window: 10:00:00 AM to 12:59:59 PM
  // This means hour must be 10, 11, or 12.
  if (hour >= 10 && hour < 13) {
    return true;
  }

  return false;
}

module.exports = {
  isPaymentWindowActive,
  isMobileLoginWindowActive,
};

