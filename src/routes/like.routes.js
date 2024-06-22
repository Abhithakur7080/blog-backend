import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleBloglike, toggleCommentlike } from "../controllers/like.controllers.js";

const router = Router();

const securedRoute = router.use(verifyJWT);
securedRoute.route("/comment/:commentId").get(toggleCommentlike)
securedRoute.route("/blog/:blogId").get(toggleBloglike)

export default router;
