const catchAsyncError = require("./catchAsyncError");
// const errorHandler = require("../utils/errorHandler")
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");


exports.isAuthenticatedUser = catchAsyncError( async(req, res, next) => {
    const {token}= req.cookies;
    
    if (!token) {
        return res.status(401).json({
            success: true,
            message: "Please Login to access this route"
        });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)){
            res.status(403).json({
                success: true,
                message: `Role: ${req.user.role} is not allowed to access this route`
            });
        }

        next();
    }
}