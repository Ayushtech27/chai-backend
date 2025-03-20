import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  loginUserService,
  logoutUserService,
  registerUserService,
  refreshAccessTokenService,
} from "../services/user.service.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  )
    throw new ApiError(400, "All fields are required");

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  const createdUser = await registerUserService({
    fullname,
    email,
    username,
    password,
    avatarLocalPath,
    coverImageLocalPath,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }
  const { loggedInUser, accessToken, refreshToken } = await loginUserService({
    email,
    username,
    password,
  });
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
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

export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await logoutUserService(userId);
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  const { accessToken, newRefreshToken } =
    await refreshAccessTokenService(incomingRefreshToken);
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed"
      )
    );
});
