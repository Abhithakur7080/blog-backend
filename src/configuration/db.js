import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URL}/${DB_NAME}`
    );
    console.log(
      `\nMONGO DB connected, DB HOST on ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGO DB connection Error", error);
    process.exit(1);
  }
};
export default connectDB;
