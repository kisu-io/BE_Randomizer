const cloudinary = require("cloudinary").v2;

// When using the Node.js SDK, keep these guidelines in mind:

// Parameter names: snake_case. For example: public_id
// Classes: PascalCase. For example: PreloadedFile
// Methods: snake_case. For example: image_upload_tag
// Pass parameter data as: Object
cloudinary.config({
  cloud_name: "tuanhoang",
  api_key: "174417364973622",
  api_secret: "ffA7p6gLkAJtEupJ8CZAZ9E02E4",
  secure: true,
});

module.exports = cloudinary;
