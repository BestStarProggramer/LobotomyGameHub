import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let uploadPath;
if (process.env.NODE_ENV === "production" || process.env.DOCKER_ENV) {
  uploadPath = path.join(process.cwd(), "uploads");
} else {
  uploadPath = path.resolve(process.cwd(), "../client/public/upload");
}

if (!fs.existsSync(path.dirname(uploadPath))) {
  uploadPath = path.join(process.cwd(), "uploads");
}

const uploadDir = uploadPath;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalName = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(originalName));
  },
});

export const upload = multer({ storage });
