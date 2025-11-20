import mongoose from "mongoose";
export const connectDB=async ()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDB connected")
    }catch (error){
console.error("error connecting to mongodb",error)
process.exit(1);
    }
}