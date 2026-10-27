import jwt from 'jsonwebtoken';

export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const secret = process.env.JWT_SECRET || 'faculty_advancement_jwt_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    secret,
    { expiresIn }
  );

  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE || '7', 10);
  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  const userSafe = {
    _id: user._id,
    name: user.name,
    email: user.email,
    facultyId: user.facultyId,
    role: user.role,
    status: user.status,
    department: user.department,
    designation: user.designation,
    profilePhotoUrl: user.profilePhotoUrl,
  };

  return res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message,
    token, // Also send token so clients can use Authorization header if preferred
    user: userSafe,
  });
};
