import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Not authorized as an admin' });
  }
};

export const adminOrOwnerProtect = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'restaurant_owner')) {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Not authorized as an admin or restaurant owner' });
  }
};
