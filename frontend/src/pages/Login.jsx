import React, { useState } from "react";
import useLoginStore from "../store/useLoginStore";
import { yupResolver } from "@hookform/resolvers/yup";
import countries from "../utils/countries";
import * as yup from "yup";

const loginValidationSchema = yup
  .object()
  .shape({
    phoneNumber: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d+$/, "phone number must be digit ")
      .transform((value, originalValue) => {
        originalValue.trim() === "" ? null : value;
      }),
    email: yup
      .string()
      .nullable()
      .notRequired()
      .email("please enter valid email")
      .transform((value, originalValue) => {
        originalValue.trim() === "" ? null : value;
      }),
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
  agreed: yup.string().oneOf([true], "You must agree to the terms & condition"),
});
const Login = () => {
  const { userPhoneData, setStep, step, setUserPhoneData, resetLoginState } =
    useLoginStore();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState();
  return (
    <div>
      <h1>login</h1>
    </div>
  );
};

export default Login;
