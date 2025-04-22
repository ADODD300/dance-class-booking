const bcrypt = require('bcryptjs');
const UserDAO = require("../models/userModel"); 
const userModel = new UserDAO("./db/users.db"); 
const jwt = require("jsonwebtoken");

exports.login = function (req, res,next) {
  let username = req.body.username;
  let password = req.body.password;

  userModel.lookup(username, function (err, user) {
    if (err) {
      console.log("error looking up user", err);
      return res.status(401).send();
    }
    if (!user) {
      console.log("User", username, "not found");
      return res.render("user/login", { error: "Invalid username or password." });
    }    
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        let payload = { username: username };
        let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,{expiresIn: 300}); 
        res.cookie("jwt", accessToken);
        next();
      } else {
        return res.render("user/login"); 
      }
    });
  });
};

exports.verify = function (req, res, next) {
  let accessToken = req.cookies.jwt;
  if (!accessToken) {
    return res.status(403).send();
  }
  let payload;
  try {
    payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    next();
  } catch (e) {
    res.status(401).send();
  }
};
