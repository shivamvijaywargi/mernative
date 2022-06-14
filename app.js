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

app.get('/', (req, res) => {
  res.send(
    `Server built by Shivam Vijaywargi you can find me @ https://github.com/shivamvijaywargi and the repository at https://github.com/shivamvijaywargi/mernative`
  );
});

export default app;
