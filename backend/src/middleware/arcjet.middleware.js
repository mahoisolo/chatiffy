import aj from "../lib/arcjet.js";
import {isSpoofedBot} from "../utils/request.util.js";

export const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision=await aj.protect(req);
        if(decision.isDenied()){
            if(decision.reason.isRateLimit()) {
                return res.status(429).json({message:"Too many requests. Please try again later."});
            }
        else if(decision.reason.isBot()){
            return res.status(403).json({message:"Access denied for bots."}); 

        }else{
            return res.status(403).json({message:"Request denied."});
        }}
        if(decision.results.some(isSpoofedBot)){
            return res.status(403).json({message:"Access denied for spoofed bots."});
        }
    } catch (error) {
        console.log ("Error in Arcjet middleware", error);
        return res.status(500).json({message:"Server error"});
    }
}