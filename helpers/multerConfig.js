const multer = require("multer");
const path = require("path");

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalName);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== "png") {
      cb(new Error("File extension not supported"), false);
      return;
    }
    cb(null, true);
  },
});
