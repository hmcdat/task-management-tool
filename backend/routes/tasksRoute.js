var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const Task = require('../models/Task');
const isAdmin = require('../middlewares/authMiddleware');
const { validObjectId } = require('../utils/common');
const { notifyTaskUpdate } = require('../services/socketService');

//get all tasks
router.get('/', async (req, res) => {
    let tasks;
    if (req.user.role !== 'admin') {
        tasks = await Task.find({ assignees: req.user._id }).sort({ createdAt: -1 });
    } else {
        tasks = await Task.find().sort({ createdAt: -1 });
    }
    return res.status(200).json({ code: 200, data: tasks });
});

router.post('/', isAdmin, async (req, res) => {
    try {
        const { title, description, assignees, dueDate } = req.body;
        if (!title || !description || !assignees || !dueDate) {
            return res.status(400).json({ code: 400, message: 'Missing required data' });
        }

        const newTask = new Task({
            title,
            description,
            assignees,
            dueDate,
            createdBy: req.user._id,
        });

        await newTask.save();

        return res.status(201).json({ code: 201, message: 'Success', data: newTask });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!validObjectId(req.params.id)) {
            return res.status(400).json({ code: 400, message: 'Invalid task ID' });
        }
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ code: 404, message: 'Task not found' });
        }

        if (req.user.role === 'employee' && !task.assignees.includes(req.user._id)) {
            return res.status(403).json({ code: 403, message: 'Access denied' });
        }
        
        return res.status(200).json({ code: 200, data: task });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (!validObjectId(req.params.id)) {
            return res.status(400).json({ code: 400, message: 'Invalid task ID' });
        }
        const { title, description } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ code: 404, message: 'Task not found' });
        }

        if (title) task.title = title;
        if (description) task.description = description;

        await task.save();

        notifyTaskUpdate(task, req.user._id, 'details-updated');

        return res.status(200).json({ code: 200, message: 'Success', data: task });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
});

router.put('/:id/assign-employees', isAdmin, async (req, res) => {
    try {
        if (!validObjectId(req.params.id)) {
            return res.status(400).json({ code: 400, message: 'Invalid task ID' });
        }
        const { assignees } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ code: 404, message: 'Task not found' });
        }

        const validAssignees = assignees.filter(id => validObjectId(id)).map(id => new mongoose.Types.ObjectId(id));

        if (assignees) task.assignees = validAssignees;
        task.markModified('assignees');

        await task.save();

        notifyTaskUpdate(task, req.user._id, 'assignees-updated');

        return res.status(200).json({ code: 200, message: 'Success', data: task });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
});

router.post('/:id/:status', async (req, res) => {
    try {
        if (!validObjectId(req.params.id)) {
            return res.status(400).json({ code: 400, message: 'Invalid task ID' });
        }
        
        if (!['done', 'undone'].includes(req.params.status)) {
            return res.status(400).json({ code: 400, message: 'Invalid status' });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ code: 404, message: 'Task not found' });
        }

        if (req.user.role === 'employee' && !task.assignees.includes(req.user._id)) {
            return res.status(403).json({ code: 403, message: 'Access denied' });
        }

        task.done = req.params.status === 'done';
        await task.save();

        notifyTaskUpdate(task, req.user._id, 'status-updated');

        return res.status(200).json({ code: 200, message: `Task marked as ${req.params.status}`, data: task });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ code: 500, message: 'Internal server error' });
    }
});

module.exports = router;