import express from 'express';
import { Book } from '../models/bookmodeles.js';
import upload from '../middleware/multer.js';
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", upload.single('image'), async (request, response) => {
   console.log(request.body)
  try {

    const token = request.headers.authorization?.split(' ')[1]; 
      if (!token) {
        return response.status(401).send({ message: "Unauthorized" });
      }
  
      const decoded = jwt.verify(token, 'your secret key'); 
      const userId = decoded.userId;

    if ( 
         !request.body.title ||
         !request.body.author ||
         !request.body.publishyear) {
      return response.status(400).send({message:"Send all required fields: title, author, publishyear"})
    }

    

    let imageUrl= '';
    if (request.file){
      imageUrl = `${request.protocol}://${request.get('host')}/uploads/${request.file.filename}`
    }
  
  
    const newBook = {
      title: request.body.title,
      author: request.body.author,
      publishyear: request.body.publishyear,
      image: imageUrl,
      userId,
    };
  
    const book = await Book.create(newBook);
    return response.status(201).send(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ "message": error.message });
  }
});

router.get('/', async(request,response) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return response.status(401).send({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, 'your secret key');
    const userId = decoded.userId;

    const books = await Book.find({userId});
      return response.status(200).json({
        count: books.length,
        data: books
      })
    
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
})

router.get('/:id', async(request,response) => {
  try {
    const {id} = request.params;
    const book = await Book.findById(id);
      return response.status(200).json(book)
    
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
})

router.put('/:id', async(request,response) => {
  try {
    if ( 
      !request.body.title ||
      !request.body.author ||
      !request.body.publishyear
    ) {
   return response.status(400).send({
      message:"Send all required fields: title, author, publishyear"
    });
 }

 const {id} = request.params;
 const result = await Book.findByIdAndUpdate(id, request.body);
 if(!result){
  return response.status(404).send({message: 'Book not found'});
 }
 return response.status(200).send({message: 'Book updated successfully'});
    
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
})

router.delete('/:id', async(request,response) => {
  try {
    const {id} = request.params;
 const result = await Book.findByIdAndDelete(id);
 if(!result){
  return response.status(404).send({message: 'Book not found'});
 }
 return response.status(200).send({message: 'Book deleted successfully'});
  } catch (error) {
    console.log(error.message);
    response.status(500).send({message: error.message});
  }
});

export default router;