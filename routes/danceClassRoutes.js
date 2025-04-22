const express = require('express');
const router = express.Router();

const controller = require('../controllers/danceClassController');
const { login, verify, verifyOrganiser } = require('../auth/auth');

router.get('/login', controller.show_login);
router.post('/login', login, controller.handle_login);
router.get('/logout', verify, controller.logout);

router.get('/organiser/dashboard', verify, controller.show_dashboard);
router.get('/organiser/courses', verify, controller.show_manage_courses);
router.get('/organiser/courses/add', verify, controller.show_add_course_form);
router.post('/organiser/courses/add', verify, controller.handle_add_course);
router.post('/organiser/courses/delete/:id', verify, controller.delete_course);
router.get('/organiser/courses/edit/:id', verify, controller.show_edit_course_form);
router.post('/organiser/courses/edit/:id', verify, controller.handle_edit_course);
router.get('/organiser/classes', verify, controller.show_manage_classes);
router.get('/organiser/classes/add', verify, controller.show_add_class_form);
router.post('/organiser/classes/add', verify, controller.handle_add_class);
router.get('/organiser/classes/edit/:id', verify, controller.show_edit_class_form);
router.post('/organiser/classes/edit/:id', verify, controller.handle_edit_class);
router.post('/organiser/classes/delete/:id', verify, controller.delete_class);
router.get('/organiser/classes/:id/participants', verify, controller.view_class_participants);
router.get('/organiser/courses/:id/participants', verify, controller.view_course_participants);
router.post('/organiser/courses/:courseId/remove/:guestId', verify, controller.remove_course_participant);
router.post('/organiser/classes/:classId/remove/:guestId', verify, controller.remove_class_participant);
router.get('/organiser/manage', verify, controller.show_manage_organisers);
router.get('/organiser/manage/add', verify, controller.show_add_organiser_form);
router.post('/organiser/manage/add', verify, controller.handle_add_organiser);
router.post('/organiser/manage/delete/:username', verify, controller.delete_organiser);


router.get('/', controller.landing_page);

router.get('/course/:id', controller.show_course_details);

router.get('/classes/:id/guest-book', controller.show_guest_booking_form);
router.post('/classes/:id/guest-book', controller.book_class_guest);

router.get('/courses/:id/guest-book', controller.show_course_booking_form);
router.post('/courses/:id/guest-book', controller.book_course_guest);

router.use(function (req, res) {
    res.status(404);
    res.type('text/plain');
    res.send('404 Not found.');
});

router.use(function (err, req, res, next) {
    res.status(500);
    res.type('text/plain');
    res.send('Internal Server Error.');
});

module.exports = router;