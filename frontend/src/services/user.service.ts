import axiosInstance from "./url.service";
interface sendOtpPayLoad {
  phoneNumber: string;
  phoneSuffix: string;
  email: string;
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
