const express = require('express');
const router = express.Router();
const { Knowledge } = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Create new knowledge
router.post('/', authMiddleware, async (req, res) => {
  try {
    const knowledge = await Knowledge.create(req.body);
    res.status(201).json(knowledge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all knowledge
router.get('/', authMiddleware, async (req, res) => {
  try {
    const knowledge = await Knowledge.findAll();
    res.json(knowledge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get knowledge by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const knowledge = await Knowledge.findByPk(req.params.id);
    if (knowledge) {
      res.json(knowledge);
    } else {
      res.status(404).json({ message: 'Knowledge not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update knowledge
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const knowledge = await Knowledge.findByPk(req.params.id);
    if (knowledge) {
      await knowledge.update(req.body);
      res.json(knowledge);
    } else {
      res.status(404).json({ message: 'Knowledge not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete knowledge
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const knowledge = await Knowledge.findByPk(req.params.id);
    if (knowledge) {
      await knowledge.destroy();
      res.json({ message: 'Knowledge deleted' });
    } else {
      res.status(404).json({ message: 'Knowledge not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;