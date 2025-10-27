import axiosInstance from "./url.service";
interface sendOtpPayLoad {
  phoneNumber: string;
  phoneSuffix: string;
  email: string;
  otp: string;
  userName: string;
  agreed: string;
  about: string;
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

export const updateProfile = async ({
  userName,
  agreed,
  about,
}: sendOtpPayLoad) => {
  try {
    const response = await axiosInstance.put("/auth/update-profile", {
      userName,
      agreed,
      about,
    });
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const checkUserAuth = async () => {
  try {
    const response = await axiosInstance.get("/auth/check-auth");
    if (response.data.status === "success") {
      return { isAuthenticated: true, user: response?.data?.data };
    } else if (response.data.status === "error") {
      return { isAuthenticated: false };
    }
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};
