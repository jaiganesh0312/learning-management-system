const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Enquiry, Role, UserRole } = require('../models/index');
const { sendOTP } = require('../utils/emailService');



const verifyOtp = (otp, otpHash) => {
  if (process.env.NODE_ENV === 'development' && otp == "123456") {
    return true;
  }
  const hash = crypto.createHash('sha256').update(otp).digest('hex');

  return hash === otpHash;
};

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      role: 'learner', // Default role
      isEmailVerified: false // Assuming email verification is needed, or set to true if not
    });

    // Assign 'learner' role in UserRole table
    const learnerRole = await Role.findOne({ where: { name: 'learner' } });
    if (learnerRole) {
      await UserRole.create({
        userId: user.id,
        roleId: learnerRole.id
      });
      
      // Set as active role
      user.activeRoleId = learnerRole.id;
      await user.save();
    }

    // Generate OTP for phone verification (keeping existing logic)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hash = crypto.createHash('sha256').update(otp).digest('hex');
    user.otpHash = hash;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    // Send OTP via email
    await sendOTP(email, otp);

    res.status(201).json({ success: true, message: 'User registered successfully. Please verify your phone/email.', userId: user.id });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body; // Changed from empCode to userId or email for general use

    // Find user by ID or Email (adjusting based on previous logic which used empCode, but standard is usually userId or email)
    // Assuming userId is passed for now as it's cleaner after registration
    let user;
    if (email) {
      user = await User.findOne({ 
        where: { email },
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'displayName', 'permissions'],
          through: { attributes: [] }
        }, {
          model: Role,
          as: 'activeRole',
          attributes: ['id', 'name', 'displayName', 'permissions']
        }]
      });
    } else {
      // Fallback or alternative lookup
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify OTP
    const hash = crypto.createHash('sha256').update(otp).digest('hex');
    if (!verifyOtp(otp, user.otpHash) || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP and verify
    user.otpHash = null;
    user.otpExpires = null;
    // user.isPhoneVerified = true; // Uncomment if field exists
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, activeRoleId: user.activeRoleId },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully', 
      token, 
      user: {
        ...user.toJSON(),
        activeRole: user.activeRole,
        roles: user.roles
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying OTP', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("email", email);
    console.log("password", password);

    // Find user with roles
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'name', 'displayName', 'permissions'],
        through: { attributes: [] }
      }, {
        model: Role,
        as: 'activeRole',
        attributes: ['id', 'name', 'displayName', 'permissions']
      }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Password not set. Please register first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Set active role if not set (first role)
    if (!user.activeRoleId && user.roles && user.roles.length > 0) {
      user.activeRoleId = user.roles[0].id;
      await user.save();
      // Reload to get activeRole populated
      await user.reload({
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'displayName', 'permissions'],
          through: { attributes: [] }
        }, {
          model: Role,
          as: 'activeRole',
          attributes: ['id', 'name', 'displayName', 'permissions']
        }]
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, activeRoleId: user.activeRoleId },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      token, 
      user: {
        ...user.toJSON(),
        activeRole: user.activeRole,
        roles: user.roles
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = req.user; // From authMiddleware

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password set successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error setting password', error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating password', error: error.message });
  }
};
