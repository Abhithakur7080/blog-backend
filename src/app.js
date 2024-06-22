import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

//create app using express
const app = express();
//enviroment configurations
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"))

//routes imports
import authRoutes from './routes/auth.routes.js'
import blogRoutes from './routes/blog.routes.js'
import likeRoutes from './routes/like.routes.js'
import commentRoutes from './routes/comment.routes.js'
import blogCategoryRoutes from './routes/blogCategory.routes.js'

//routes use
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/blog", blogRoutes)
app.use("/api/v1/like", likeRoutes)
app.use("/api/v1/comment", commentRoutes)
app.use("/api/v1/blog-category", blogCategoryRoutes)

export default app;
