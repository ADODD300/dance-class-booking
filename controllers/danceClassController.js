const UserDAO = require("../models/userModel");
const courseDao = require("../models/courseModel");
const classDao = require("../models/classModel");

const classDB = new classDao("./db/classes.db");
const courseDB = new courseDao("./db/courses.db");
const userDao = new UserDAO("./db/users.db");

const { v4: uuidv4 } = require('uuid'); 

exports.show_login = function (req, res) {
  res.render("user/login",);
};

exports.handle_login = function (req, res) {
  res.redirect('/organiser/dashboard');
};

exports.show_dashboard = function(req, res) {
  res.render('dashboard', {
    title: 'Organiser Dashboard'
  });
};

exports.show_manage_courses = function (req, res) {
  courseDB.getAllCourses(function (err, courses) {
    if (err) return res.status(500).send("Failed to load courses.");

    courses.forEach(course => {
      course.courseId = course._id;
    });

    res.render("manageCourses", {
      title: "Manage Courses",
      courses: courses
    });
  });
};


exports.show_manage_organisers = function (req, res) {
  userDao.db.find({}, function (err, users) {
    if (err) return res.status(500).send("Failed to load organisers.");
    res.render("manageOrganisers", {
      title: "Manage Organisers",
      users: users
    });
  });
};

exports.show_add_organiser_form = function (req, res) {
  res.render("addOrganiser", { title: "Add Organiser" });
};

exports.handle_add_organiser = function (req, res) {
  const { username, password } = req.body;

  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) return res.status(500).send("Error hashing password.");

    const entry = { user: username, password: hash };

    userDao.db.insert(entry, function (err) {
      if (err) return res.status(500).send("Error adding organiser.");
      res.redirect("/organiser/manage");
    });
  });
};

exports.delete_organiser = function (req, res) {
  const username = req.params.username;

  userDao.db.remove({ user: username }, {}, function (err, numRemoved) {
    if (err) return res.status(500).send("Failed to delete organiser.");
    res.redirect("/organiser/manage");
  });
};

exports.show_add_course_form = function (req, res) {
  res.render("addCourse", {
    title: "Add New Course"
  });
};

exports.handle_add_course = function (req, res) {
  const { name, description, startDate, endDate, price } = req.body;

  const newCourse = {
    name,
    description,
    startDate,
    endDate,
    price: parseFloat(price),
    createdAt: new Date(),
    participants: []
  };

  courseDB.addCourse(newCourse);
  res.redirect('/organiser/courses');
};

exports.delete_course = function (req, res) {
  const courseId = req.params.id;

  courseDB.db.remove({ _id: courseId }, {}, function (err, numRemoved) {
    if (err) {
      console.error("Failed to delete course:", err);
      return res.status(500).send("Could not delete course.");
    }

    res.redirect('/organiser/courses');
  });
};

exports.show_edit_course_form = function (req, res) {
  const courseId = req.params.id;

  courseDB.getCourseById(courseId, function (err, course) {
    if (err || !course) {
      return res.status(404).send("Course not found.");
    }

    res.render("editCourse", {
      title: "Edit Course",
      course: course
    });
  });
};

exports.handle_edit_course = function (req, res) {
  const courseId = req.params.id;
  const { name, description, startDate, endDate, price } = req.body;

  const updatedCourse = {
    name,
    description,
    startDate,
    endDate,
    price: parseFloat(price)
  };

  courseDB.db.update(
    { _id: courseId },       
    { $set: updatedCourse },            
    {},                                 
    function (err, numReplaced) {
      if (err) {
        console.error("Error updating course:", err);
        return res.status(500).send("Could not update course.");
      }

      res.redirect("/organiser/courses");
    }
  );
};

exports.show_manage_classes = function (req, res) {
  classDB.getAllClasses(function (err, classes) {
    if (err) return res.status(500).send("Failed to load classes.");

    classes.forEach(cls => {
      cls.classId = cls._id;
    });

    res.render("manageClasses", {
      title: "Manage Classes",
      classes: classes
    });
  });
};

exports.show_add_class_form = function (req, res) {
  courseDB.getAllCourses(function (err, courses) {
    if (err) {
      return res.status(500).send("Could not load courses.");
    }

    res.render("addClass", {
      title: "Add Class",
      courses: courses
    });
  });
};

exports.handle_add_class = function (req, res) {
  const { courseName, date, time, location, description } = req.body;

  const newClass = {
    courseName,
    date,
    time,
    location,
    description,
    participants: [],
    createdAt: new Date()
  };

  classDB.addClass(newClass);
  res.redirect('/organiser/classes');
};

exports.handle_add_class = function (req, res) {
  const { courseName, date, time, location, description } = req.body;

  const newClass = {
    courseName,
    date,
    time,
    location,
    description,
    participants: [],
    createdAt: new Date()
  };

  classDB.addClass(newClass);
  res.redirect('/organiser/classes');
};
exports.show_edit_class_form = function (req, res) {
  const classId = req.params.id;

  classDB.getCourseById(classId, function (err, session) {
    if (err || !session) {
      return res.status(404).send("Class not found.");
    }

    courseDB.getAllCourses(function (err, courses) {
      if (err) return res.status(500).send("Error loading courses.");

      res.render("editClass", {
        title: "Edit Class",
        class: session,
        courses: courses
      });
    });
  });
};
exports.handle_edit_class = function (req, res) {
  const classId = req.params.id;
  const { courseName, date, time, location, description } = req.body;

  const updated = {
    courseName,
    date,
    time,
    location,
    description
  };

  classDB.db.update({ _id: classId }, { $set: updated }, {}, function (err) {
    if (err) {
      return res.status(500).send("Failed to update class.");
    }

    res.redirect("/organiser/classes");
  });
};

exports.delete_class = function (req, res) {
  const classId = req.params.id;

  classDB.db.remove({ _id: classId }, {}, function (err) {
    if (err) {
      return res.status(500).send("Failed to delete class.");
    }

    res.redirect("/organiser/classes");
  });
};

exports.view_class_participants = function (req, res) {
  const classId = req.params.id;

  classDB.getCourseById(classId, function (err, session) {
    if (err || !session) {
      return res.status(404).send("Class not found.");
    }

    res.render("viewClassParticipants", {
      title: "Class Participants",
      class: session,
      participants: session.participants
    });
  });
};

exports.view_course_participants = function (req, res) {
  const courseId = req.params.id;

  courseDB.getCourseById(courseId, function (err, course) {
    if (err || !course) {
      return res.status(404).send("Course not found.");
    }

    res.render("viewCourseParticipants", {
      title: "Course Participants",
      course: course,
      participants: course.participants
    });
  });
};

exports.remove_course_participant = function (req, res) {
  const { courseId, guestId } = req.params;

  courseDB.getCourseById(courseId, function (err, course) {
    if (err || !course) return res.status(404).send("Course not found.");

    const updatedCourseParticipants = course.participants.filter(p => p.id !== guestId);

    courseDB.db.update(
      { _id: courseId },
      { $set: { participants: updatedCourseParticipants } },
      {},
      function (err) {
        if (err) return res.status(500).send("Failed to remove from course.");

        classDB.getClassesByCourse(course.name, function (err, classes) {
          if (err) return res.status(500).send("Error fetching related classes.");

          classes.forEach(cls => {
            const updatedClassParticipants = (cls.participants || []).filter(p => p.id !== guestId);

            classDB.db.update(
              { _id: cls._id },
              { $set: { participants: updatedClassParticipants } },
              {},
              function (err) {
                if (err) console.error(`Failed to update class ${cls._id}:`, err);
              }
            );
          });

          res.redirect("/organiser/courses");
        });
      }
    );
  });
};

exports.remove_class_participant = function (req, res) {
  const { classId, guestId } = req.params;

  classDB.getCourseById(classId, function (err, session) {
    if (err || !session) return res.status(404).send("Class not found.");

    const updated = session.participants.filter(p => p.id !== guestId);

    classDB.db.update(
      { _id: classId },
      { $set: { participants: updated } },
      {},
      function (err) {
        if (err) return res.status(500).send("Failed to remove participant.");
        res.redirect("/organiser/classes");
      }
    );
  });
};

exports.logout = function (req, res) {
  res.clearCookie("jwt");
  res.redirect("/login");
};

exports.landing_page = function (req, res) {
  courseDB.getAllCourses(function (err, list) {
    if (err) {
      console.log("Error loading courses");
      res.status(500).send();
      return;
    }
    res.render("index", {
      title: "Dance Organisation",
      courses: list,
    });
  });
};

exports.show_course_details = function (req, res) {
  const courseId = req.params.id;

  courseDB.getCourseById(courseId, function (err, course) {
    if (err || !course) {
      return res.status(404).send("Course not found.");
    }

    classDB.getClassesByCourse(course.name, function (err, classes) {
      if (err) {
        return res.status(500).send("Error loading classes.");
      }

      res.render("courseDetails", {
        title: "Course Details",
        course: course,
        classes: classes,
        user: req.session?.user
      });
    });
  });
};

exports.show_guest_booking_form = function (req, res) {
  const classId = req.params.id;

  classDB.getCourseById(classId, function (err, session) {
    if (err || !session) {
      return res.status(404).send("Class not found.");
    }

    res.render("guestBook", {
      class: session
    });
  });
};

exports.book_class_guest = function (req, res) {
  const classId = req.params.id;
  const { name, email, phone } = req.body;
  const bookingId = uuidv4(); 

  const guest = {
    id: bookingId,
    name,
    email,
    phone
  };

  classDB.addGuestToClass(classId, guest, function (err, result) {
    if (err) {
      return res.status(500).send("Failed to book class.");
    }

    classDB.getCourseById(classId, function (err, session) {
      if (err || !session) {
        return res.status(500).send("Booking saved but failed to load class info.");
      }

      res.render("bookingSuccess", {
        guest: guest,
        class: session
      });
    });
  });
};

exports.show_course_booking_form = function (req, res) {
  const courseId = req.params.id;

  courseDB.getCourseById(courseId, function (err, course) {
    if (err || !course) {
      return res.status(404).send("Course not found.");
    }

    res.render("bookCourse", {
      course: course
    });
  });
};

exports.book_course_guest = function (req, res) {
  const courseId = req.params.id;
  const { name, email, phone } = req.body;
  const guestId = uuidv4();

  const guest = {
    id: guestId,
    name,
    email,
    phone
  };

  courseDB.getCourseById(courseId, function (err, course) {
    if (err || !course) {
      return res.status(404).send("Course not found.");
    }

    courseDB.addParticipant(courseId, guest, function (err) {
      if (err) {
        return res.status(500).send("Error adding to course.");
      }

      classDB.getClassesByCourse(course.name, function (err, classes) {
        if (err) {
          return res.status(500).send("Error loading classes.");
        }

        classes.forEach(session => {
          if (!session.participants) session.participants = [];
          session.participants.push(guest);

          classDB.db.update(
            { _id: session._id },
            { $set: { participants: session.participants } },
            {},
            function (err) {
              if (err) console.error("Failed to update class:", session._id);
            }
          );
        });

        res.render("bookingSuccess", {
          guest: guest,
          course: course
        });
      });
    });
  });
};
