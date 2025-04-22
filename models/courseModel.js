const nedb = require('gray-nedb');
const classModel = require('./classModel'); 

class Course {
  constructor(dbFilePath) {
    if (dbFilePath) {
      this.db = new nedb({ filename: dbFilePath, autoload: true });
      console.log('Course DB connected to ' + dbFilePath);
    } else {
      this.db = new nedb();
    }
  }

  init() {
    this.db.insert({
      name: 'Salsa for Beginners',
      description: 'Learn the basics of Salsa dancing.',
      startDate: '2024-05-01',
      endDate: '2024-07-01',
      price: 50,
      participants: [],
      createdAt: new Date()
    });
    console.log('Seed course inserted');
  }

  addCourse(courseData) {
    const course = {
      name: courseData.name,
      description: courseData.description,
      startDate: courseData.startDate,
      endDate: courseData.endDate,
      price: courseData.price,
      participants: [],
      createdAt: new Date()
    };

    this.db.insert(course, function (err, doc) {
      if (err) {
        console.log('Error inserting course:', err);
      } else {
        console.log('Course inserted:', doc.name);
      }
    });
  }

  addParticipant(courseId, participant, callback) {
    const that = this;
    this.db.findOne({ _id: courseId }, function (err, course) {
      if (err || !course) {
        return callback(err || new Error("Course not found"), null);
      }
  
      if (!course.participants) {
        course.participants = [];
      }
  
      course.participants.push(participant);
  
      that.db.update({ _id: courseId }, { $set: { participants: course.participants } }, {}, function (err, numUpdated) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, numUpdated);
        }
      });
    });
  }
  

  getAllCourses(callback) {
    this.db.find({}).sort({ startDate: 1 }).exec(function (err, courses) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, courses);
      }
    });
  }

  getCourseByName(name, callback) {
    this.db.findOne({ name: name }, function (err, course) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, course);
      }
    });
  }

  deleteCourseByName(name, callback) {
    const that = this;
    this.db.remove({ name: name }, {}, function (err, numRemoved) {
      if (err) {
        callback(err, null);
      } else {
        classModel.deleteClassesByCourse(name, function (classErr, numDeleted) {
          if (classErr) {
            console.log('Course deleted but failed to delete associated classes.');
          } else {
            console.log(`Deleted ${numDeleted} associated class(es).`);
          }
          callback(null, numRemoved);
        });
      }
    });
  }

  getCourseById(courseid, callback) {
    this.db.findOne({ _id: courseid }, function (err, course) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, course);
      }
    });
  }
  
}



module.exports = Course;
