export const generateOtpCode = () => {
  const otp = Math.floor(10000 + Math.random() * 90000); // Generates a random 5-digit number
  return otp.toString();
};
