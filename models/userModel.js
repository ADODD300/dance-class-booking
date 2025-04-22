const Datastore = require("gray-nedb");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

class UserDAO {
  constructor(dbFilePath) {
    const resolvedPath = dbFilePath || path.join(__dirname, "../db/users.db");

    const dbDir = path.dirname(resolvedPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (!fs.existsSync(resolvedPath)) {
      fs.writeFileSync(resolvedPath, "");
    }

    this.db = new Datastore({ filename: resolvedPath, autoload: true });
  }

  init() {
    this.db.insert({
      user: "Peter",
      password: "$2b$10$I82WRFuGghOMjtu3LLZW9OAMrmYOlMZjEEkh.vx.K2MM05iu5hY2C",
    });
    this.db.insert({
      user: "Ann",
      password:
        "$2b$10$bnEYkqZM.MhEF/LycycymOeVwkQONq8kuAUGx6G5tF9UtUcaYDs3S",
    });
    return this;
  }

  create(username, password) {
    const that = this;
    bcrypt.hash(password, saltRounds).then(function (hash) {
      const entry = {
        user: username,
        password: hash,
      };
      that.db.insert(entry, function (err) {
        if (err) {
          console.log("Can't insert user: ", username);
        }
      });
    });
  }

  lookup(user, cb) {
    this.db.find({ user: user }, function (err, entries) {
      if (err || entries.length === 0) {
        return cb(null, null);
      }
      return cb(null, entries[0]);
    });
  }
}

module.exports = UserDAO;
