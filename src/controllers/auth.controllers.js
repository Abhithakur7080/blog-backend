import { cloudinaryUploading } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { validateMongoDBId } from "../utils/validateMongoDBId.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    //validate id
    validateMongoDBId(userId);
    //get user from database
    const user = await User.findById(userId);
    //generate access token
    const accessToken = user.generateAccessToken();
    //generate refresh token
    const refreshToken = user.generateRefreshToken();

    //save refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    //after save return both generated access and refresh token
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  //get text data from body
  const { displayName, email, password, username } = req.body;
  //validate
  //if some fields are empty or not
  if (
    [displayName, email, password, username].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All field are required");
  }
  //check if already exists from email or username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  //if user already exists
  if (existedUser) {
    throw new ApiError(400, "user with email or username already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //if avatar not uploaded
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await cloudinaryUploading(avatarLocalPath, "users");
  //if avatar not uploaded on cloudinary
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  //after successfull uploaded
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    displayName,
    password,
    avatar: {
      public_id: avatar.public_id,
      url: avatar.url,
    },
  });
  //after successfull created also check the user and for frontend remove password and refreshToken
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  //at last return response
  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get text data from body
  const { email, username, password } = req.body;
  //validation
  //if both the required field not exists
  if (!username && !email) {
    throw new ApiError(400, "username or password is required");
  }
  //anyone field exist
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  //check if user not exist
  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }
  //check user entered password matched with user password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credientials");
  }
  //if password match then get access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  //again get user data
  //we have two options from database or update already user available user available will previously
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //set frontend cannot be modify it is secured
  const options = {
    htmlOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    //get token
    const getToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!getToken) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedGetToken = jwt.verify(
      getToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedGetToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (getToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, refreshToken: newRefreshToken })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
const changeCurrentPassword = asyncHandler(async (req, res) => {
  //get passwords from body and if also confirm password available
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Incorrect Password");
  }
  //find user from database
  const user = await User.findById(req.user?._id);
  //check password is correct or not
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  //if not then return with error
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }
  //set password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully");
});
const updateAccountDetail = asyncHandler(async (req, res) => {
  const { displayName, email } = req.body;
  if (!displayName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        displayName: displayName,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await cloudinaryUploading(avatarLocalPath, "users");
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          public_id: avatar.public_id,
          url: avatar.url,
        },
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Successfully"));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  updateUserAvatar,
};
