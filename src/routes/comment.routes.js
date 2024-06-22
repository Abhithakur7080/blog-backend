import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getblogComments,
  updateComment,
} from "../controllers/comment.controllers.js";

const router = Router();
const securedRoute = router.use(verifyJWT);
securedRoute.route("/:blogId").get(getblogComments);
securedRoute.route("/:blogId").post(addComment);
securedRoute.route("/:commentId").patch(updateComment);
securedRoute.route("/:commentId").delete(deleteComment);

export default router;
