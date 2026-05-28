const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/toeicController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { toeicUpload } = require('../config/cloudinary');

// User
router.get('/tests',                  verifyToken, ctrl.getTests);
router.get('/tests/:id',              verifyToken, ctrl.getTestById);
router.post('/tests/:id/submit',      verifyToken, ctrl.submitTest);
router.get('/results/:attemptId',     verifyToken, ctrl.getAttemptResult);
router.get('/history',                verifyToken, ctrl.getHistory);

// Admin — image upload (Cloudinary)
router.post(
  '/admin/upload',
  verifyAdmin,
  toeicUpload.array('images', 30),
  (req, res) => {
    const files = (req.files || []).map(f => ({
      original: f.originalname,
      url:      f.path,        // Cloudinary trả về URL trực tiếp qua f.path
    }));
    res.json({ success: true, files });
  }
);

// Admin — CRUD
router.get('/admin/tests',            verifyAdmin, ctrl.getAllTests);
router.post('/admin/tests',           verifyAdmin, ctrl.createTest);
router.put('/admin/tests/:id',        verifyAdmin, ctrl.updateTest);
router.delete('/admin/tests/:id',     verifyAdmin, ctrl.deleteTest);
router.post('/admin/groups',          verifyAdmin, ctrl.createGroup);
router.put('/admin/groups/:id',       verifyAdmin, ctrl.updateGroup);
router.delete('/admin/groups/:id',    verifyAdmin, ctrl.deleteGroup);
router.post('/admin/questions',       verifyAdmin, ctrl.createQuestion);
router.put('/admin/questions/:id',    verifyAdmin, ctrl.updateQuestion);
router.delete('/admin/questions/:id', verifyAdmin, ctrl.deleteQuestion);

module.exports = router;
