import axiosInstance from "./url.service";
interface sendOtpPayLoad {
  phoneNumber: string;
  phoneSuffix: string;
  email: string;
  otp: string;
}
export const sendOtp = async ({
  phoneNumber,
  phoneSuffix,
  email,
}: sendOtpPayLoad) => {
  try {
    const response = await axiosInstance.post("/auth/send-otp", {
      phoneNumber,
      phoneSuffix,
      email,
    });
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const verifyOtp = async ({
  phoneNumber,
  phoneSuffix,
  email,
  otp,
}: sendOtpPayLoad) => {
  try {
    const response = await axiosInstance.post("/auth/verify-otp", {
      phoneNumber,
      phoneSuffix,
      email,
      otp,
    });
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};
