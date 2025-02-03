import express, { request, response } from "express";
import { port, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
// import { Book } from "./models/bookmodeles.js";
import booksRoute from './roots/booksroot.js';
import userRoot from "./roots/userRout.js";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(express.urlencoded({extended:true})) 
// app.use( "/uploads", express.static(uploads)) 
// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());


let corsOptions = {
  origin : ['http://localhost:5173', 'https://booksstore-app-client.vercel.app/']
}

app.use(cors(corsOptions))

app.get("/", (request, response) => {
  console.log(request);
  return response.status(234).send("Welcome to MERN stack tutorial");
});

app.use('/books', booksRoute);
app.use('/user', userRoot);


mongoose
  .connect(mongoDBURL)

  .then(() => {
    console.log("App connected to database");
    app.listen(port, () => {
      console.log(`App is listening to port: ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
