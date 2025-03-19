import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { registerUserService } from "../services/user.service.js";

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
