const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  try {
    // Extract the token from various sources (cookies, body, headers)
    const token =
      req.cookies.token || req.body.token || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '');
    // console.log(token)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please Login to Access this',
      });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach the decoded user information to the request object
      req.user = decoded; 
      
      // Move to the next middleware or route handler
      next(); 
    } catch (error) {
      // Log the specific error for debugging
      console.error('JWT Verification Error:', error.message);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
 
  } catch (error) {
    // Handle any unexpected errors
    console.error('Internal Server Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};