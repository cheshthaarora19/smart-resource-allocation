const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const VolunteerProfile = require('../models/VolunteerProfile');
const { protect } = require('../middleware/authMiddleware');

// @route   PATCH /api/tasks/:task_id/status
// @desc    Update task status
// @access  Protected
router.patch('/:task_id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['unassigned', 'assigned', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be: unassigned, assigned, in_progress, or completed'
      });
    }

    const updateData = { status };

    // If completed, set completed_at timestamp
    if (status === 'completed') {
      updateData.completed_at = Date.now();

      // Find task to get volunteer
      const task = await Task.findById(req.params.task_id);
      if (task && task.assigned_to) {
        // Increment volunteer tasks_completed and set back to available
        await VolunteerProfile.findOneAndUpdate(
          { user_id: task.assigned_to },
          {
            $inc: { tasks_completed: 1 },
            availability: 'available',
            current_task_id: null
          }
        );
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.task_id,
      updateData,
      { new: true }
    ).populate('assigned_to', 'name email')
     .populate('report_id');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tasks/volunteer/:volunteer_id
// @desc    Get all tasks for a specific volunteer
// @access  Protected
router.get('/volunteer/:volunteer_id', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assigned_to: req.params.volunteer_id })
      .populate('report_id')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;