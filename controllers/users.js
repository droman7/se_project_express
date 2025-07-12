const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const { CREATED, OK } = require("../utils/errors");

const BadRequestError = require("../utils/badrequesterror");
const ConflictError = require("../utils/confilcterror");
const NotFoundError = require("../utils/notfounderror");
const UnauthorizedError = require("../utils/unauthorizederror");

// Create user
const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  if (!validator.isEmail(email)) {
    return next(new BadRequestError("Invalid email format"));
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        throw new ConflictError("Email already exists");
      }

      return bcrypt
        .hash(password, 10)
        .then((hash) => User.create({ name, avatar, email, password: hash }))
        .then((user) =>
          res.status(CREATED).send({
            name: user.name,
            avatar: user.avatar,
            email: user.email,
            _id: user._id,
          })
        );
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

// GET current user
const getCurrentUser = (req, res, next) =>
  User.findById(req.user._id)
    .orFail(() => new NotFoundError("User not found"))
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid User ID"));
      }
      return next(err);
    });

// Login user
const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) =>
      res.status(OK).send({
        token: jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" }),
      })
    )
    .catch((err) => {
      if (err.message === "Incorrect email or password") {
        return next(new UnauthorizedError(err.message));
      }
      return next(err);
    });
};

// Update current user
const updateCurrentUser = (req, res, next) => {
  const { name, avatar } = req.body;

  return User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail(() => new NotFoundError("User not found"))
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError(err.message));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid User ID"));
      }
      return next(err);
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
