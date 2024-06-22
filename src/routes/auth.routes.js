import { Router } from "express";
import { uploadPhoto } from "../middlewares/multer.middleware.js";
import {
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetail,
  updateUserAvatar,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  uploadPhoto.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

const securedRoute = router.use(verifyJWT);
securedRoute.route("/logout").post(logoutUser);
securedRoute.route("/change-password").post(changeCurrentPassword);

securedRoute.route("/current-user").get(getCurrentUser);

securedRoute.route("/update-account").patch(updateAccountDetail);

securedRoute.route("/avatar").patch(uploadPhoto.single("avatar"), updateUserAvatar);

export default router;
