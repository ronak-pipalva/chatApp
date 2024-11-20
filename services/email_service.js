import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import ejs from "ejs";
import dotenv from "dotenv";

dotenv.config();
// Define __dirname equivalent in ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transporter = nodemailer.createTransport({
  service: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  secure: true,
});

const sendMail = async (obj) => {
  if (!Array.isArray(obj.to)) {
    obj.to = [obj.to];
  }

  let htmlText = "";
  if (obj.template) {
    try {
      const rootDir = path.resolve(__dirname, ".."); // Adjust this as necessary based on your directory structure
      const templatePath = path.join(
        rootDir,
        obj.template.replace(/^\/+/, ""),
        "html.ejs"
      );

      htmlText = await ejs.renderFile(templatePath, obj.data || {});
    } catch (error) {
      console.error("Error rendering email template:", error);
      throw new Error("Failed to render email template.");
    }
  }

  let mailOpts = {
    from: obj.from || "noreply@yoyo.co",
    subject: obj.subject || "Sample Subject",
    to: obj.to,
    cc: obj.cc || [],
    bcc: obj.bcc || [],
    html: htmlText,
    attachments: obj.attachments || [],
  };

  return transporter.sendMail(mailOpts);
};

export default sendMail;
