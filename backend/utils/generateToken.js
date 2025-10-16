import jsonwebtoken from "jsonwebtoken";

export const generateToken = (userId) => {
  return jsonwebtoken.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1y",
  });
};
