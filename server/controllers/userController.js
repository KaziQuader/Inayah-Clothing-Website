const User = require("../models/userModels");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const getResetPassToken = require("../models/userModels");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const userModels = require("../models/userModels");
// const ErrorHandler = require("../utils/errorHandler");
// const catchAsyncError = require("../middleware/catchAsyncError");

// Register User
exports.registerUser = async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, 201, res);
};

// Login User
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  // Checking if user has given email and password both
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Please enter Email or password",
    });
  }

  const user = await User.findOne({ email: email }).select("+password");

  if (!user) {
    res.status(401).json({
      success: false,
      message: "Invalid Email or Password",
    });
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    res.status(401).json({
      success: false,
      message: "Invalid Email or Password",
    });
  }

  sendToken(user, 200, res);
};

// User Logout
exports.logout = async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Get reset Password Token
  const resetToken = user.getResetPassToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const msg = `Your password reset token is: -\n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Inayah Password Recovery`,
      msg,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  // Creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: "Reset Password Token is invalid or has expired",
    });
  }

  if (req.body.password !== req.body.confirmPassword) {
    res.status(404).json({
      success: false,
      message: "Password does not match",
    });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
};

// Get User Details
exports.getUserDetails = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  res.status(200).json({
    success: true,
    user,
  });
};

// Update User Password
exports.updateUserPassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    res.status(401).json({
      success: false,
      message: "Password Does not match",
    });
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    res.status(401).json({
      success: false,
      message: "Password Does not match",
    });
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
};

// Update User Profile
exports.updateUserProfile = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
};

// Get all Users (admin)
exports.getAllUsers = async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
};

// Get single User (admin)
exports.userDetailsAdmin = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(200).json({
      success: false,
      message: `User does not exist with id: ${req.params.id}`,
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
};

// Update User Role (admin)
exports.updateUserRole = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
};

// Delete User (admin)
exports.deleteUser = async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User Doesnot exist",
    });
  }

  res.status(200).json({
    success: true,
  });
};
