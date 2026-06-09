const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Prefer a mock session user (set by /auth/mock-login) to avoid hitting the DB
    if (req.session && req.session.mockUser) {
      const u = Object.assign({}, req.session.mockUser);
      if (u) delete u.googleId;
      return res.status(200).json(u);
    }

    const dbAvailable = req.app && req.app.locals && req.app.locals.dbConnected === true;
    if (!dbAvailable) {
      const u = Object.assign({}, req.user);
      if (u) delete u.googleId;
      return res.status(200).json(u);
    }

    const user = await User.findById(req.user.id).select('-googleId');
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { rollNumber, branch, semester } = req.body;

    if (rollNumber && !/^[A-Z0-9]+$/i.test(rollNumber)) {
      return res.status(400).json({ error: 'Invalid roll number format' });
    }

    if (semester && (semester < 1 || semester > 8)) {
      return res.status(400).json({ error: 'Semester must be between 1 and 8' });
    }

    const validBranches = ['CSE', 'ECE', 'ME', 'CE', 'EEE', 'OTHERS'];
    if (branch && !validBranches.includes(branch)) {
      return res.status(400).json({ error: 'Invalid branch' });
    }

    const dbAvailable = req.app && req.app.locals && req.app.locals.dbConnected === true;
    if (!dbAvailable) {
      // update mock user in session for local testing
      if (req.session && req.session.mockUser) {
        const m = req.session.mockUser;
        if (rollNumber) m.rollNumber = rollNumber;
        if (branch) m.branch = branch;
        if (semester) m.semester = semester;
        m.updatedAt = new Date();
        req.session.mockUser = m;
      }
      return res.status(200).json({ message: 'Profile updated (mock)', user: req.session.mockUser || req.user });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { rollNumber, branch, semester, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-googleId');

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const dbAvailable = req.app && req.app.locals && req.app.locals.dbConnected === true;
    if (!dbAvailable) {
      return res.status(200).json([]);
    }

    const users = await User.find({ role: 'student' }).select('-googleId');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};
