//dotenv setup
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

//get connecton app with database then run
import connectDB from "./configuration/db.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 7000, () => {
      console.log(`Server is running on PORT : ${process.env.PORT || 7000}`);
    });
  })
  .catch((err) => {
    console.log("MONGDB connection failed!!!", err);
  });
