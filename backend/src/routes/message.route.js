import express from "express";
const router=express.Router();

router.get("/messages",(req,res)=>{
    res.send("Get all messages");
});
export default router;