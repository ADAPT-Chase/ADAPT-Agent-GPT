const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const cache = require('../config/cache');
const logger = require('../config/logger');

const validateTask = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('status').isIn(['pending', 'in_progress', 'completed']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Invalid date format')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/', auth, async (req, res) => {
  try {
    const cacheKey = `tasks:${req.user.id}`;
    const cachedTasks = await cache.get(cacheKey);

    if (cachedTasks) {
      return res.json(cachedTasks);
    }

    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    await cache.set(cacheKey, tasks, 300); // Cache for 5 minutes
    res.json(tasks);
  } catch (err) {
    logger.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', [auth, validateTask, handleValidationErrors], async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      userId: req.user.id
    });
    await cache.set(`tasks:${req.user.id}`, null);
    res.status(201).json(task);
  } catch (err) {
    logger.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', [
  auth,
  param('id').isInt().withMessage('Invalid task ID'),
  validateTask,
  handleValidationErrors
], async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const { title, description, status, dueDate } = req.body;
    await task.update({ title, description, status, dueDate });
    await cache.set(`tasks:${req.user.id}`, null);
    res.json(task);
  } catch (err) {
    logger.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', [
  auth,
  param('id').isInt().withMessage('Invalid task ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.destroy();
    await cache.set(`tasks:${req.user.id}`, null);
    res.json({ message: 'Task removed' });
  } catch (err) {
    logger.error('Error deleting task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;