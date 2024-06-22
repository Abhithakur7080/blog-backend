import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getOwnBlogs,
  getSingleBlog,
  getUserBlogs,
  updateBlog,
} from "../controllers/blog.controllers.js";

const router = Router();

router.route("/").get(getAllBlogs);
router.route("/single/:blogId").get(getSingleBlog);
router.route("/user-blog/:userId").get(getUserBlogs);

const securedRoute = router.use(verifyJWT);
securedRoute.route("/").post(createBlog);
securedRoute.route("/own-blog").get(getOwnBlogs);
securedRoute.route("/:blogId").patch(updateBlog);
securedRoute.route("/:blogId").delete(deleteBlog);

export default router;
