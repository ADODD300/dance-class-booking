const fs = require('fs');
const CourseModel = require('./models/courseModel');
const ClassModel = require('./models/classModel');
const UserDAO = require('./models/userModel');

const courseDB = new CourseModel('./db/courses.db');
const classDB = new ClassModel('./db/classes.db');
const userDAO = new UserDAO('./db/users.db');

// Ensure ./db directory exists
if (!fs.existsSync('./db')) {
  fs.mkdirSync('./db');
}

// -------------------
// USERS
// -------------------
function seedUsers() {
  userDAO.create('organiser', 'organiser123');
  console.log('✅ Organiser user created');
}

// -------------------
// PARTICIPANTS
// -------------------
const sampleParticipants = [
  { id: 'p1', name: 'Alice Smith', email: 'alice@example.com', phone: '07111111111' },
  { id: 'p2', name: 'Bob Johnson', email: 'bob@example.com', phone: '07222222222' },
  { id: 'p3', name: 'Charlie Lee', email: 'charlie@example.com', phone: '07333333333' },
  { id: 'p4', name: 'Dana King', email: 'dana@example.com', phone: '07444444444' }
];

// -------------------
// COURSES
// -------------------
const sampleCourses = [
  {
    name: 'Salsa for Beginners',
    description: 'Learn the basics of Salsa dancing.',
    startDate: '2025-05-01',
    endDate: '2025-06-01',
    price: 40,
    participants: [sampleParticipants[0], sampleParticipants[1]]
  },
  {
    name: 'Hip Hop Intermediate',
    description: 'Take your street style to the next level.',
    startDate: '2025-05-03',
    endDate: '2025-07-01',
    price: 55,
    participants: [sampleParticipants[2], sampleParticipants[3]]
  },
  {
    name: 'Contemporary Flow',
    description: 'Smooth and expressive choreography.',
    startDate: '2025-06-01',
    endDate: '2025-07-15',
    price: 50,
    participants: [sampleParticipants[0], sampleParticipants[2]]
  },
  {
    name: 'Latin Fusion',
    description: 'A mix of Latin styles for advanced dancers.',
    startDate: '2025-06-10',
    endDate: '2025-07-25',
    price: 60,
    participants: [sampleParticipants[1], sampleParticipants[3]]
  }
];

// -------------------
// Generate Classes Per Course
// -------------------
function generateClassesFor(course, participants) {
  return [
    {
      courseId: course._id,
      courseName: course.name,
      date: '2025-05-01',
      time: '18:00',
      location: 'Studio A',
      description: `${course.name} - Week 1`,
      participants: [...participants]
    },
    {
      courseId: course._id,
      courseName: course.name,
      date: '2025-05-08',
      time: '18:00',
      location: 'Studio B',
      description: `${course.name} - Week 2`,
      participants: [...participants]
    }
  ];
}

// -------------------
// Seed Courses + Classes
// -------------------
function seedCoursesAndClasses() {
  sampleCourses.forEach((courseData, index) => {
    courseDB.db.insert(courseData, (err, savedCourse) => {
      if (err) {
        console.error(`❌ Error adding course: ${courseData.name}`, err);
        return;
      }

      console.log(`✅ Course saved: ${savedCourse.name}`);

      // Generate and insert related classes
      const relatedClasses = generateClassesFor(savedCourse, courseData.participants);

      relatedClasses.forEach(cls => {
        classDB.db.insert(cls, (err2, savedClass) => {
          if (err2) {
            console.error(`❌ Error adding class for ${savedCourse.name}`, err2);
          } else {
            console.log(`   📅 Class saved: ${savedClass.description}`);
          }
        });
      });
    });
  });
}


// -------------------
// Run Seeder
// -------------------
function runSeed() {
  seedUsers();
  setTimeout(seedCoursesAndClasses, 1000);
}

runSeed();
