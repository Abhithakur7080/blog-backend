import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createBlog, getAllBlogs, getOwnBlogs, getSingleBlog, getUserBlogs, updateBlog } from "../controllers/blog.controllers.js";

const router = Router();

router.route("/").get(getAllBlogs)
router.route("/single/:blogId").get(getSingleBlog)
router.route("/user-blog").get(getUserBlogs)

const securedRoute = router.use(verifyJWT);
securedRoute.route("/create").post(createBlog)
securedRoute.route("/own-blog").get(getOwnBlogs)
securedRoute.route("/update/:blogId").patch(updateBlog)

export default router;
