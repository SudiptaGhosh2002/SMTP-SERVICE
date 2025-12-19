import express from 'express'
import dotenv from 'dotenv'
 import connectDB from './db/db.js'
import AuthRouters from './routes/Auth.routes.js'
import cors from 'cors';
dotenv.config()
const app = express()
connectDB();
// In your backend server file (index.js/app.js)
 
app.use(cors({
    origin: process.env.REACT_APP_URL, // Your React app URL
    credentials: true
}));
app.get('/', (req, res) => {
    res.send("API is working");
});
app.use(express.json());
app.use('/auth', AuthRouters);
const PORT = process.env.PORT ||5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});