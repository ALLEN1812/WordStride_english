const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/vocabController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// ── User routes ────────────────────────────────────────────
router.get('/topics',                  verifyToken, ctrl.getTopics);
router.get('/topics/:id',              verifyToken, ctrl.getTopicById);
router.put('/flashcards/:id/progress', verifyToken, ctrl.updateProgress);

// Custom sets
router.get('/my-sets',                 verifyToken, ctrl.getMySets);
router.post('/my-sets',                verifyToken, ctrl.createMySet);
router.get('/my-sets/:id',             verifyToken, ctrl.getMySetById);
router.put('/my-sets/:id',             verifyToken, ctrl.updateMySet);
router.delete('/my-sets/:id',          verifyToken, ctrl.deleteMySet);
router.post('/my-sets/:id/items',      verifyToken, ctrl.addSetItem);
router.put('/my-sets/items/:itemId',   verifyToken, ctrl.updateSetItem);
router.delete('/my-sets/items/:itemId',verifyToken, ctrl.deleteSetItem);

// ── Admin routes ───────────────────────────────────────────
router.get('/admin/topics',                   verifyAdmin, ctrl.getAdminTopics);
router.post('/admin/topics',                  verifyAdmin, ctrl.createTopic);
router.put('/admin/topics/:id',               verifyAdmin, ctrl.updateTopic);
router.delete('/admin/topics/:id',            verifyAdmin, ctrl.deleteTopic);
router.get('/admin/topics/:id/flashcards',    verifyAdmin, ctrl.getAdminFlashcards);
router.post('/admin/topics/:id/import',       verifyAdmin, ctrl.importFlashcards);
router.post('/admin/flashcards',              verifyAdmin, ctrl.createFlashcard);
router.put('/admin/flashcards/:id',           verifyAdmin, ctrl.updateFlashcard);
router.delete('/admin/flashcards/:id',        verifyAdmin, ctrl.deleteFlashcard);

module.exports = router;
