import otpGenerate from "../utils/otpGenerater";
import User from "../models/user";
import response from "../utils/responseHandler";
const sendOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email } = req.body;
  const otp = otpGenerate();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  let user;
  try {
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        user = new User({ email });
      }
      user.emailOtp = otp;
      user.emailOtpExpiry = expiry;
      await user.save();
      return response(res, 200, `otp send to your ${email}`);
    }
    if (!phoneNumber || phoneSuffix) {
      return response(res, 400, "Phone number and country code are required");
    }
    const fullPhoneNumber = `${phoneNumber}${phoneNumber}`;
    user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await new User({ phoneNumber, phoneSuffix });
    }
    await user.save();
    return response(res, 200, "otp send successfully", user);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error ");
  }
};
