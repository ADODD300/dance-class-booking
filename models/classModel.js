const nedb = require('gray-nedb');

class Class {
  constructor(dbFilePath) {
    if (dbFilePath) {
      this.db = new nedb({ filename: dbFilePath, autoload: true });
      console.log('Class DB connected to ' + dbFilePath);
    } else {
      this.db = new nedb();
    }
  }

  addClass(classData) {
    const session = {
      courseName: classData.courseName,
      date: classData.date,
      time: classData.time,
      location: classData.location,
      description: classData.description,
      participants: [],
      createdAt: new Date()
    };

    this.db.insert(session, function (err, doc) {
      if (err) {
        console.log('Error inserting class:', err);
      } else {
        console.log('Class inserted on', doc.date);
      }
    });
  }

  getAllClasses(callback) {
    this.db.find({}).sort({ date: 1 }).exec(function (err, classes) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, classes);
      }
    });
  }

  getClassesByCourse(courseName, callback) {
    this.db.find({ courseName: courseName }).sort({ date: 1 }).exec(function (err, classes) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, classes);
      }
    });
  }

  bookUser(classId, username, callback) {
    const that = this;
    this.db.findOne({ _id: classId }, function (err, session) {
      if (err || !session) {
        callback(err || new Error('Class not found'), null);
      } else {
        if (!session.participants.includes(username)) {
          session.participants.push(username);
        }

        that.db.update({ _id: classId }, { $set: { participants: session.participants } }, {}, function (err, numUpdated) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, numUpdated);
          }
        });
      }
    });
  }

  getParticipants(classId, callback) {
    this.db.findOne({ _id: classId }, function (err, session) {
      if (err || !session) {
        callback(err || new Error('Class not found'), null);
      } else {
        callback(null, session.participants);
      }
    });
  }

  deleteClassById(classId, callback) {
    this.db.remove({ _id: classId }, {}, function (err, numRemoved) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, numRemoved);
      }
    });
  }

  deleteClassesByCourse(courseName, callback) {
    this.db.remove({ courseName: courseName }, { multi: true }, function (err, numRemoved) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, numRemoved);
      }
    });
  }
  getCourseById(classId, callback) {
    this.db.findOne({ _id: classId }, function (err, course) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, course);
      }
    });
  }

  addGuestToClass(classId, guest, callback) {
    const that = this;
    this.db.findOne({ _id: classId }, function (err, session) {
      if (err || !session) {
        return callback(err || new Error("Class not found"), null);
      }
  
      session.participants.push(guest);
  
      that.db.update({ _id: classId }, { $set: { participants: session.participants } }, {}, function (err, numUpdated) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, numUpdated);
        }
      });
    });
  }
  
}




module.exports = Class;
