export const sendToken = async (res, user, statusCode, message) => {
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    tasks: user.tasks,
    verified: user.verified,
  };

  const token = user.getJWTToken();

  const options = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message,
    user: userData,
  });
};
