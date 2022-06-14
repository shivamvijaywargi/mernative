import { config } from 'dotenv';
import cloudinary from 'cloudinary';

import app from './app.js';
import { connectDb } from './config/db.js';

config({
  path: './config/config.env',
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDb();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
