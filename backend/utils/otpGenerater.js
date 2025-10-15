const otpGenerate = () => {
  return Math.floor(100000 + Math.random() * 80000).toString();
};
export default otpGenerate;
