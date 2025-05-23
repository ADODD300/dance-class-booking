const Datastore = require("gray-nedb");
const path = require("path");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

class UserDAO {
  constructor(dbFilePath) {
    let options;

    if (process.env.RENDER) {
      console.log("Running on Render — using in-memory users DB");
      options = {};
    } else {
      options = {
        filename: dbFilePath || path.join(__dirname, "../db/users.db"),
        autoload: true,
      };
    }

    this.db = new Datastore(options);
  }

  init() {
    this.db.insert({
      user: "Peter",
      password:
        "$2b$10$I82WRFuGghOMjtu3LLZW9OAMrmYOlMZjEEkh.vx.K2MM05iu5hY2C",
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
