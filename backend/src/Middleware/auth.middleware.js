
import User from "../Models/user.model.js";
import jwt from "jsonwebtoken";
import {apiError} from '../Utils/apiError.js'

export const verifyJWT = async (req, __, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

        if(!token){
            throw new apiError(401, "Unauthorized access!!!");
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodeToken?._id).select("-password");
        
        if(!user){
            throw new apiError(401, "Invalid Access Token!!!");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new apiError(401, error?.message || "Unauthorized access!!!");
    }
}