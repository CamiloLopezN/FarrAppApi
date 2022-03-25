const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, UserFacebook, Company, Admin, Client } = require("../models/entity.model");
const { generateToken } = require("../middlewares/oauth/authentication");
const roles = require("../middlewares/oauth/roles");
const utils = require("./utils");
const { authorize } = require("../middlewares/oauth/authentication");
const { validatePass } = require("./password.controller");
const validator = require(`../middlewares/validations/validation`);
const userValidation = require("../middlewares/validations/user.joi");
const axios = require("axios");
const { log } = require("debug");

const loginFacebook = async (req, res) => {
  const userIdAndToken = req.body;
  let token;
  const payload = {};
  const userInfo = {};

  const check = await axios.get(
    `https://graph.facebook.com/${userIdAndToken.id}?fields=id,first_name, last_name,email,gender,birthday,picture&access_token=${userIdAndToken.token}`
  );
  let email = check.data.email;


  const user = await UserFacebook.findOne({ email });


  if (check.status === 200) {
    if (user) {
      const client = await Client.findOne(
        { userId: user[`_id`] },
        { _id: 1, firstName: 1, lastName: 1 }
      );
      payload.roleId = client[`_id`];
      payload.role = roles.client;
      userInfo.firstName = client["firstName"];
      userInfo.lastName = client[`lastName`];
      payload.userId = user[`_id`];
      token = await generateToken(payload);
    } else {

      let first_name = check.data[`first_name`];
      let last_name = check.data.last_name;

      const user = new UserFacebook({
        email: check.data.email,
        role: roles.client,
        hasReqDeactivation: false,
        isActive: true,
        isVerified: true
      });

      const client2 = new Client({
        userId: user._id,
        firstName: first_name,
        lastName: last_name,
        birthdate: new Date(),
        gender: "Hombre"
      });

      const foundClient = await UserFacebook.findOne({ email });
      if (!foundClient) {
        await client2.save();
        await user.save();
      }
      let client = await Client.findOne(
        { userId: user[`_id`] },
        { _id: 1, firstName: 1, lastName: 1 }
      );
      payload.roleId = client[`_id`];
      payload.role = roles.client;
      userInfo.firstName = client["firstName"];
      userInfo.lastName = client[`lastName`];
      payload.userId = user[`_id`];
      token = await generateToken(payload);
    }
    return res.status(200).json({ token, userInfo });
  } else {
    return res.status(403).send({ message: "InvalidToken" });
  }
};
module.exports.loginFacebook = [loginFacebook];


const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(password);
  let token;
  const payload = {};
  const userInfo = {};
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ message: "Incomplete or bad formatted data" });

    if (!user[`isActive`]) return res.status(403).send({ message: "Forbidden" });

    if (!(await bcrypt.compare(password, user[`password`]))) {
      return res
        .status(401)
        .json({ message: "Wrong or no authentication email/password provided" });
    }
    if (!user[`isVerified`]) return res.status(403).send({ message: "Email is not verified" });

    if (user[`role`] === roles.company) {
      const company = await Company.findOne(
        { userId: user[`_id`] },
        { _id: 1, companyName: 1, customerId: 1 }
      );
      payload.roleId = company[`_id`];
      payload.customerId = company[`customerId`];
      payload.role = roles.company;
      userInfo.firstName = company[`companyName`];
    } else if (user[`role`] === roles.admin) {
      const admin = await Admin.findOne(
        { userId: user[`_id`] },
        { _id: 1, firstName: 1, lastName: 1 }
      );
      payload.roleId = admin[`_id`];
      payload.role = roles.admin;
      userInfo.firstName = admin[`firstName`];
      userInfo.lastName = admin[`lastName`];
    } else {
      const client = await Client.findOne(
        { userId: user[`_id`] },
        { _id: 1, firstName: 1, lastName: 1 }
      );
      payload.roleId = client[`_id`];
      payload.role = roles.client;
      userInfo.firstName = client[`firstName`];
      userInfo.lastName = client[`lastName`];
    }
    payload.userId = user[`_id`];
    token = await generateToken(payload);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: "Incomplete or bad formatted client data", errors: err.errors });
    console.log(err);
    return res.status(500).json({ message: `internal server error  ${err}` });
  }
  return res.status(200).json({ token, userInfo });
};
module.exports.login = [validator(userValidation.login), login];

const reqDeactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.payload.userId !== userId)
      return res.status(400).json({ message: "Incomplete or bad formatted client data" });
    const data = {
      $set: {
        hasReqDeactivation: true
      }
    };
    const update = await User.findOneAndUpdate({ _id: userId }, data);
    if (!update) return res.status(404).json({ message: "Resource not found" });
    return res.status(200).json({ message: "Operación realizada satisfactoriamente!" });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: "Incomplete or bad formatted client data", errors: error.errors });
    return res.status(500).json({ message: `internal server error  ${error}` });
  }
};
module.exports.reqDeactivateUser = [
  authorize([roles.admin, roles.client, roles.company]),
  reqDeactivateUser
];

const recoverPassword = async (req, res) => {
  const { email } = req.body;
  const foundUser = await User.findOne({ email });
  if (foundUser) {
    const password = utils.randomPassword(8, "alf");
    const encryptedPassword = await foundUser.encryptPassword(password);
    await User.updateOne({ email }, { $set: { password: encryptedPassword } });
    utils.sendRecoverPassword(email, password);
  }
  return res.status(200).json({ message: "Successful operation" });
};
module.exports.recoverPassword = [validator(userValidation.email), recoverPassword];

const verifyAccount = async (req, res) => {
  const { token } = req.params;
  if (!token || !req.params) return res.status(403).send({ message: "Forbidden" });
  try {
    const payload = await jwt.verify(token, process.env.JWT_KEY);
    const data = { isVerified: true };
    await User.findOneAndUpdate({ email: payload.email }, { $set: data }).orFail();
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: "Incomplete or bad formatted client data", errors: err.errors });

    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: "Resource not found" });

    if (err instanceof jwt.JsonWebTokenError)
      return res.status(403).json({ message: "Invalid Token" });

    if (err instanceof jwt.TokenExpiredError)
      return res.status(403).json({ message: "Token Expired" });

    return res.status(500).json({ message: `Internal server error` });
  }
  return res.render("redirection.html");
};
module.exports.verifyAccount = [verifyAccount];

const getUserById = async (req, res) => {
  const idUser = req.params.userId;
  if (req.payload.role !== roles.admin && req.payload.userId !== idUser)
    return res.status(403).json({ message: "Forbidden" });
  try {
    const user = await User.findOne(
      { _id: idUser },
      { password: 0, createdAt: 0, updatedAt: 0, __v: 0, _id: 0 }
    ).orFail();
    return res.status(200).json(user);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: "Not found resource" });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: "Incomplete or bad formatted client data" });
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.getUserById = [authorize([roles.admin, roles.company, roles.client]), getUserById];

const getUsers = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const projection = { password: 0, createdAt: 0, updatedAt: 0, __v: 0, _id: 0 };
  let users;
  try {
    users = await User.paginate({}, { projection, limit, page });
    if (!users) return res.status(404).json({ message: "Resource not found" });
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: "Not found resource" });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: "Incomplete or bad formatted client data" });
    return res.status(500).json({ message: "Internal server error" });
  }
  return res.status(200).json(users);
};
module.exports.getUsers = [authorize([roles.admin]), getUsers];

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { email, password } = req.body;
  if (req.payload.role !== roles.admin && req.payload.userId !== userId)
    return res.status(403).json({ message: "Forbidden" });
  try {
    const user = await User.findOne({ _id: userId }).orFail();
    const pass = await user.encryptPassword(password);
    const data = { $set: { email, password: pass } };
    await User.updateOne({ _id: userId }, data);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: "Not found resource" });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: "Incomplete or bad formatted client data" });
    return res.status(500).json({ message: "Internal server error" });
  }
  return res.status(200).json({ message: "Successful operation" });
};
module.exports.updateUser = [
  authorize([roles.admin, roles.company, roles.client]),
  validator(userValidation.login),
  validatePass,
  updateUser
];

const refreshToken = async (req, res) => {
  const payload = {};
  const userInfo = {};
  let token;
  try {
    const user = await User.findOne({ _id: req.payload.userId }).orFail();

    if (user.role === roles.company) {
      const company = await Company.findOne(
        // eslint-disable-next-line no-underscore-dangle
        { userId: user._id },
        { _id: 1, companyName: 1, customerId: 1 }
      ).orFail();
      // eslint-disable-next-line no-underscore-dangle
      payload.roleId = company._id;
      payload.customerId = company.customerId;
      payload.role = roles.company;
      userInfo.firstName = company.companyName;
    } else if (user.role === roles.admin) {
      // eslint-disable-next-line no-underscore-dangle
      const admin = await Admin.findOne(
        // eslint-disable-next-line no-underscore-dangle
        { userId: user._id },
        { _id: 1, firstName: 1, lastName: 1 }
      );
      // eslint-disable-next-line no-underscore-dangle
      payload.roleId = admin._id;
      payload.role = roles.admin;
      userInfo.firstName = admin.firstName;
      userInfo.lastName = admin.lastName;
    } else {
      // eslint-disable-next-line no-underscore-dangle
      const client = await Client.findOne(
        // eslint-disable-next-line no-underscore-dangle
        { userId: user._id },
        { _id: 1, firstName: 1, lastName: 1 }
      );
      // eslint-disable-next-line no-underscore-dangle
      payload.roleId = client._id;
      payload.role = roles.client;
      userInfo.firstName = client.firstName;
      userInfo.lastName = client.lastName;
    }

    // eslint-disable-next-line no-underscore-dangle
    payload.userId = user._id;
    token = await generateToken(payload);
  } catch (err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError)
      return res.status(404).json({ message: "User not found" });
    if (err instanceof mongoose.Error.ValidationError)
      return res
        .status(400)
        .json({ message: "Incomplete or bad formatted client data", errors: err.errors });
    return res.status(500).json({ message: `internal server error  ${err}` });
  }
  return res.status(200).json({ token, userInfo });
};
module.exports.refreshToken = [refreshToken];

const postUserAccount = async (req, res) => {
  const { userId } = req.params;
  const { isVerified, hasReqDeactivation, isActive } = req.body;
  if (req.payload.role !== roles.admin && req.payload.userId !== userId)
    return res.status(403).json({ message: "Forbidden" });
  try {
    const data = { $set: { isVerified, hasReqDeactivation, isActive } };
    await User.findOneAndUpdate({ _id: userId }, data).orFail();
  } catch (err) {
    if (
      err instanceof mongoose.Error.DocumentNotFoundError ||
      err instanceof mongoose.Error.CastError
    )
      return res.status(404).json({ message: "Resource not found" });
    if (err instanceof mongoose.Error.ValidationError)
      return res.status(400).json({ message: "Incomplete or bad formatted client data" });
    return res.status(500).json({ message: "Internal server error" });
  }
  return res.status(200).json({ message: "Successful operation" });
};
module.exports.postUserAccount = [authorize(roles.admin), postUserAccount];
