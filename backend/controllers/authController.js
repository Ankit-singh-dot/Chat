import otpGenerate from "../utils/otpGenerater";
import User from "../models/user";
import response from "../utils/responseHandler";
import { sendOtpToEmail } from "../services/emailServices";
// import twilioServices from "../services/twilioServices";
import { sendOtpToPhoneNumber } from "../services/twilioServices";
import { verifyOtp } from "../services/twilioServices";
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
      await sendOtpToEmail(email, otp);
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
    await sendOtpToPhoneNumber(fullPhoneNumber);
    await user.save();

    return response(res, 200, "otp send successfully", user);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error ");
  }
};

const verifyOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;
  try {
    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return response(res, 404, "user not found");
      }
      const now = new Date();
      if (
        !user.emailOtp ||
        String(user.emailOtp) !== String(otp) ||
        now > new Date(user.emailOtpExpiry)
      ) {
        return response(res, 400, "Invalid or expiry otp");
      }
      user.isVerified = true;
      user.emailOtp = null;
      user.emailOtpExpiry = null;
    } else {
      if (!phoneNumber || !phoneSuffix) {
        return response(res, 404, "phone number and phone suffix are required");
      }
      const fullPhoneNumber = `${phoneNumber}${phoneSuffix}`;
      user = await User.findOne({ fullPhoneNumber });
      if (!user) {
        return response(req, 404, "user not found");
      }
      const result = await verifyOtp(fullPhoneNumber, otp);
      if (result.status !== "approved") {
        return response(res, 404, "Invalid Otp");
      }
      user.isVerified = true;
      await user.save();
    }
    await user.save();
  } catch (error) {}
};
