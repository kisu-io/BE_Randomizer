const nodemailer = require("nodemailer");
const Template = require("../models/Template");

const emailHelpers = {};
emailHelpers.sendTestEmail = async () => {
  try {
    let transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    let info = await transport.sendMail({
      from: '"Khoi" <michael.vu0102@gmail.com>',
      to: "kisu.vn@gmail.com",
      subject: "Good morning",
      text: "Plain body no style",
      html: "<p>Hello, this is test email</p>",
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
};

emailHelpers.createTemplateIfNotExists = async () => {
  try {
    let found = await Template.findOne({ template_key: "verify_email" });
    if (!found) {
      const newTemplate = {
        name: "Verify Email Template",
        template_key: "verify_email",
        description: "This template is used when user register a new email",
        from: "'CoderSchool Team' <social_blog@coderschool.vn>",
        subject: `Hi %name%, welcome to CoderSchool!`,
        html: `Hi <strong>%name%</strong> ,
          <br /> <br /> 
          Thank you for your registration.
          <br /> <br /> 
          Please confirm your email address by clicking on the link below.
          <br /> <br />
          %link%
          <br /> <br />
          If you face any difficulty during the sign-up, do get in
          touch with our Support team: apply@coderschool.vn
          <br /> <br /> Always be learning!
          <br /> CoderSchool Team
          `,
        variables: ["name", "link"],
      };
      found = await Template.create(newTemplate);
    }
  } catch (error) {
    console.log(error);
  }
};

emailHelpers.createSingleEmailFromTemplate = async (
  template_key,
  variablesObj,
  toEmail
) => {
  try {
    const template = await Template.findOne({ template_key });
    if (!template) throw new Error("Invalid template key");
    const data = {
      from: template.name,
      to: toEmail,
      subject: template.subject,
      html: template.html,
    };

    template.variables.forEach((key) => {
      if (!variablesObj[key]) throw new Error("missing info for key");
      let regPattern = new RegExp(`%${key}%`, "g");
      data.subject = data.subject.replace(regPattern, variablesObj[key]);
      data.html = data.html.replace(regPattern, variablesObj[key]);
    });
    return data;
  } catch (error) {
    console.log("Error at eh.cseft 65", error.message);
  }
};

emailHelpers.send = async (data) => {
  try {
    if (!data) throw new Error("Need email data");
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    let info = await transporter.sendMail(data);

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.log(err);
  }
};

module.exports = emailHelpers;
