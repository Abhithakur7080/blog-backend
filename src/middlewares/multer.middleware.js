import multer from "multer";

const multerStorage = multer.diskStorage({
    //destination setting where temperory save data
  destination: function (req, file, cb) {
    cb(null, "./public/images/");
  },
  //setting file formatted name
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },
});
//filter out restrict only image save in our database
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      {
        message: "Unsupported file format.",
      },
      false
    );
  }
};
//set all these combined functions with 2mb size of image accept
const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2000000 },
});
export { uploadPhoto };
