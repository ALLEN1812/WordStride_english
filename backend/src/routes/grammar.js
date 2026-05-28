const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/grammarController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// User routes
router.get('/lessons',                   verifyToken, ctrl.getLessons);
router.get('/lessons/:id',               verifyToken, ctrl.getLessonById);
router.get('/sections/:id',              verifyToken, ctrl.getSectionById);
router.post('/sections/:id/submit',      verifyToken, ctrl.submitSection);

// Admin routes — lessons
router.post('/admin/lessons',            verifyAdmin, ctrl.createLesson);
router.put('/admin/lessons/:id',         verifyAdmin, ctrl.updateLesson);
router.delete('/admin/lessons/:id',      verifyAdmin, ctrl.deleteLesson);

// Admin routes — sections
router.post('/admin/sections',           verifyAdmin, ctrl.createSection);
router.put('/admin/sections/:id',        verifyAdmin, ctrl.updateSection);
router.delete('/admin/sections/:id',     verifyAdmin, ctrl.deleteSection);

// Admin routes — questions
router.post('/admin/questions',          verifyAdmin, ctrl.createQuestion);
router.put('/admin/questions/:id',       verifyAdmin, ctrl.updateQuestion);
router.delete('/admin/questions/:id',    verifyAdmin, ctrl.deleteQuestion);

module.exports = router;
