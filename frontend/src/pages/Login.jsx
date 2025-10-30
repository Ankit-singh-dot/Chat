import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import countries from "../utils/countries";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useThemeStore from "../store/themeStore";
import useUserStore from "../store/useUserStore";
import useLoginStore from "../store/useLoginStore";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

const loginValidationSchema = yup
  .object()
  .shape({
    phoneNumber: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d+$/, "phone number must be digit ")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value
      ),
    email: yup
      .string()
      .nullable()
      .notRequired()
      .email("please enter valid email")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value
      ),
  })
  .test(
    "at least one ",
    "either email or phone number is required",
    function (value) {
      return !!(value.phoneNumber || value.email);
    }
  );
const otpValidationSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, "otp must be of 6 digit ")
    .required("otp is required "),
});

const profileValidationSchema = yup.object().shape({
  userName: yup.string().required("username is required"),
  agreed: yup
    .boolean()
    .oneOf([true], "You must agree to the terms & condition"),
});

const avatars = [
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe",
];

const Login = () => {
  const { userPhoneData, setStep, step, setUserPhoneData, resetLoginState } =
    useLoginStore();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { theme, setTheme } = useThemeStore();

  const {
    register: loginRegister,
    handleSubmit: handelLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({ resolver: yupResolver(loginValidationSchema) });

  const {
    handleSubmit: handelOtpSubmit,
    formState: { errors: otpError },
    setValue: setOtpValue,
  } = useForm({ resolver: yupResolver(otpValidationSchema) });
  const {
    register: profileRegister,
    handleSubmit: handelProfileSubmit,
    formState: { errors: registerError },
    watch,
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
  });

  const ProgressBar = () => {
    return (
      <div
        className={`w-full ${
          theme === "dark" ? "bg-gray-700" : "bg-white"
        } rounded-full h-2.5 mb-6`}
      >
        <div
          className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(step / 3) * 100}` }}
        ></div>
      </div>
    );
  };
  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-gradient-to-br from-green-400 to-blue-500"
      } flex items-center justify-center p-4 overflow-hidden`}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
        } p-6 md:p-8 rounded-lg shadow-2xl w-full  max-w-md relative z-10`}
        // max-w-md => This box won’t grow wider than this limit even on big screens. 	Sets the maximum width of the box to a medium size
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.2,
            damping: 20,
            stiffness: 250,
            type: "spring",
          }}
          className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <FaWhatsapp className="size-10" />
        </motion.div>
        <h1
          className={`text-2xl font-bold text-center mb-6 ${
            theme === "dark" ? "text-white" : "text-gray "
          }`}
        >
          {" "}
          WhatsApp login
        </h1>
        <ProgressBar />
        {error && <p className="text-red-500 text-centre mb-4">{error}</p>}
        {step === 1 && (
          <form className="space-y-4">
            <p
              className={`text-center ${
                theme === "dark" ? "text-white-300" : "text-white-700"
              } mb-4`}
            >
              Enter your phone number to receive otp{" "}
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
