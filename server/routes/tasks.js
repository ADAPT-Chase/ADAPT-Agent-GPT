const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { Task, User } = require('../config/database').models;
const cache = require('../config/cache');
const logger = require('../config/logger');
const CustomError = require('../utils/CustomError');

const validateTask = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('status').isIn(['pending', 'in_progress', 'completed']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Invalid date format')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError('Validation failed', 400, 'VALIDATION_ERROR');
  }
  next();
};

router.get('/', auth, async (req, res, next) => {
  try {
    const cacheKey = `tasks:${req.user.id}`;
    const cachedTasks = await cache.get(cacheKey);

    if (cachedTasks) {
      return res.json(JSON.parse(cachedTasks));
    }

    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    await cache.set(cacheKey, JSON.stringify(tasks), 300); // Cache for 5 minutes
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.post('/', [auth, validateTask, handleValidationErrors], async (req, res, next) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      userId: req.user.id
    });
    await cache.del(`tasks:${req.user.id}`);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', [
  auth,
  param('id').isInt().withMessage('Invalid task ID'),
  validateTask,
  handleValidationErrors
], async (req, res, next) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) {
      throw new CustomError('Task not found', 404, 'TASK_NOT_FOUND');
    }
    const { title, description, status, dueDate } = req.body;
    await task.update({ title, description, status, dueDate });
    await cache.del(`tasks:${req.user.id}`);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', [
  auth,
  param('id').isInt().withMessage('Invalid task ID'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!task) {
      throw new CustomError('Task not found', 404, 'TASK_NOT_FOUND');
    }
    await task.destroy();
    await cache.del(`tasks:${req.user.id}`);
    res.json({ message: 'Task removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;