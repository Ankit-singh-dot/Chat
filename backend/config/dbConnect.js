import mongoose from "mongoose";
const connectDb = async() =>{
    try {
            await mongoose.connect(process.env.MONGO_URL);
            console.log("Mongo database connected successfully")
    } catch (error) {
        console.log("error connecting database", error.message)
        process.exit(1)
    }

}
export default connectDb;