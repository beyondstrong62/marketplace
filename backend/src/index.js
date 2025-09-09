import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './Database/db.js';
import router from './Routes/routes.js';
dotenv.config({
    path: './.env'
});
const app=express();
app.use(cors({
    origin: process.env.FRONTEND_URL, // not '*', not from env for now
    credentials: true
}));
app.use(express.json()); // to get data in json format on req.body also body-parser is used earlier (now deprecated)
app.use(express.urlencoded({extended:true})); //to get data on req.body
app.use(cookieParser()); // to get access of cookies


const port=process.env.PORT || 5001

app.use("/api/v1",router)


connectDB();
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})

