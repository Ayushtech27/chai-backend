import { REFRESH_TOKEN_SECRET } from "../config/index.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return {
      accessToken,
      refreshToken,
    };
  } catch {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh tokens"
    );
  }
};

export const registerUserService = async ({
  fullname,
  email,
  username,
  password,
  avatarLocalPath,
  coverImageLocalPath,
}) => {
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with the same email or username already exists"
    );
  }

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) throw new ApiError(400, "Avatar upload failed");

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) throw new ApiError(500, "Error while creating user");

  return createdUser;
};

export const loginUserService = async ({ email, username, password }) => {
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user doesn't exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return { loggedInUser, accessToken, refreshToken };
};

export const logoutUserService = async (userId) => {
  await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: "" } },
    { new: true }
  );
};

export const refreshAccessTokenService = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return { accessToken, newRefreshToken };
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
};

export const changeCurrentPasswordService = async (
  oldPassword,
  newPassword,
  user
) => {
  if (!oldPassword) {
    throw new ApiError(401, "oldPassword is required");
  }
  if (!newPassword) {
    throw new ApiError(401, "newPassword is required");
  }
  if (!user) {
    throw new ApiError(401, "user not identified");
  }
  try {
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "something went wrong while changing the password"
    );
  }
};

export const updateAccountDetailsService = async (fullName, email, userId) => {
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  if (!userId) {
    throw new ApiError(400, "userId not found");
  }
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          fullName,
          email,
        },
      },
      { new: true }
    ).select("-password");
    return user;
  } catch (error) {
    throw new ApiError(
      401,
      error?.message ||
        "something went wrong while updating the account details"
    );
  }
};

export const updateUserAvatarService = async (avatarLocalPath, userId) => {
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const oldAvatarUrl = user.avatar;
    if (oldAvatarUrl) {
      await deleteFromCloudinary(user.avatar);
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
      throw new ApiError(400, "Error while uploading on avatar");
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { new: true }
    ).select("-password");
    return updatedUser;
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "something went wrong while updating the avatar"
    );
  }
};

export const updateUserCoverImageService = async (
  coverImageLocalPath,
  userId
) => {
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const oldCoverImageUrl = user.coverImage;
    if (oldCoverImageUrl) {
      await deleteFromCloudinary(user.coverImage);
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
      throw new ApiError(400, "Error while uploading on cover image");
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          coverImage: coverImage.url,
        },
      },
      { new: true }
    ).select("-password");
    return updatedUser;
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "something went wrong while updating the cover image"
    );
  }
};
