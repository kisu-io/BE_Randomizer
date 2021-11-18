const express = require("express");
const sendResponse = require("../helpers/sendResponse");
const router = express.Router();
const { createSingleEmailFromTemplate } = require("../helpers/email.helper");
const emailHelpers = require("../helpers/email.helper");

router.post("/send-email", async (req, res, next) => {
  try {
    let { name, code, toEmail } = req.body;
    console.log(req.body);
    if (!name || !code || !toEmail) throw new Error("Missing Details");
    const template_key = "verify_email";
    const variablesObj = {
      name,
      code,
    };
    const data = await createSingleEmailFromTemplate(
      template_key,
      variablesObj,
      toEmail
    );
    emailHelpers.send(data);
  } catch (error) {
    return next(error);
  }
  return sendResponse(res, 200, true, null, null, "Success Sending Email");
});

module.exports = router;
