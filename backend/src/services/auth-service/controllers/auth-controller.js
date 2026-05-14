import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user-model.js";

const jwtSecret = process.env.JWT_SECRET;

const signToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "30d",
      issuer: "uniportal",
      audience: "uniportal-clients",
    },
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(409).json({
        success: false,
        message: "user with this email already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = {
      name,
      email,
      password: hash,
      role: role === "admin" ? "admin" : "student",
    };
    const savedUser = await User.create(user);

    const token = signToken(savedUser);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user not found",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "invalid password",
      });
    }

    const token = signToken(user);
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};
