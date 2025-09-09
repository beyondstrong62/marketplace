import mongoose from "mongoose"

const connectDB=async()=>{
   try {
     const connect=await mongoose.connect(`${process.env.MONGO_URL}/`);
     if(connect){
        console.log(`Connection to database established : ${connect.connection.host}`);
     }
     else throw new Error("Connection to database not established")
   } catch (error) {
        console.log(`Error connecting to database : ${error.message}`);
   }
}

export default connectDB;