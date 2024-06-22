import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCatagory,
  deleteCatagory,
  getAcategory,
  getAllCategories,
  updateCatagory,
} from "../controllers/blogCategory.controllers.js";

const router = Router();

router.route("/").get(getAllCategories);
router.route("/:id").get(getAcategory);

const securedRoute = router.use(verifyJWT);
securedRoute.route("/").post(createCatagory);
securedRoute.route("/:id").patch(updateCatagory);
securedRoute.route("/:id").delete(deleteCatagory);

export default router;
