const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campusconnect_default_secret_key', {
    expiresIn: '7d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact college administration.',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Fetch associated profile details
    let profileData = null;
    if (user.role === 'student') {
      profileData = await Student.findOne({ user: user._id })
        .populate('department', 'name code');
    } else if (user.role === 'faculty' || user.role === 'hod') {
      profileData = await Faculty.findOne({ user: user._id })
        .populate('department', 'name code')
        .populate('subjects', 'name code')
        .populate('assignedClasses.subject', 'name code')
        .populate('assignedClasses.department', 'name code');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        lastLogin: user.lastLogin,
        profile: profileData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current logged in user & profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let profileData = null;
    if (user.role === 'student') {
      profileData = await Student.findOne({ user: user._id })
        .populate('department', 'name code');
    } else if (user.role === 'faculty' || user.role === 'hod') {
      profileData = await Faculty.findOne({ user: user._id })
        .populate('department', 'name code')
        .populate('subjects', 'name code')
        .populate('assignedClasses.subject', 'name code')
        .populate('assignedClasses.department', 'name code');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        lastLogin: user.lastLogin,
        profile: profileData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile',
    });
  }
};

// @desc    Update profile photo or phone
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (req.file) {
      user.profilePhoto = `/uploads/${req.file.filename}`;
      await user.save();
    }

    if (user.role === 'student') {
      await Student.findOneAndUpdate(
        { user: user._id },
        { 
          ...(phone && { phone }),
          ...(address && { address }),
          ...(req.file && { profilePhoto: `/uploads/${req.file.filename}` }),
        }
      );
    } else if (user.role === 'faculty' || user.role === 'hod') {
      await Faculty.findOneAndUpdate(
        { user: user._id },
        { 
          ...(phone && { phone }),
          ...(req.file && { profilePhoto: `/uploads/${req.file.filename}` }),
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error changing password',
    });
  }
};
