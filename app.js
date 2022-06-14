import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import userRoutes from './routes/userRoutes.js';
import fileUpload from 'express-fileupload';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(cors());
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
  })
);

app.use('/api/v1', userRoutes);

export default app;
