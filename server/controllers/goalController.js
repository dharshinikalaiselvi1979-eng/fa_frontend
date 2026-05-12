const Goal = require("../models/Goal");

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ deadline: 1 });
    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, deadline, color } = req.body;
    
    if (!title || !targetAmount || !deadline) {
      res.status(400);
      throw new Error("Title, target amount, and deadline are required");
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline: new Date(deadline),
      color
    });

    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal progress
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error("Goal not found");
    }

    if (goal.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error("User not authorized");
    }

    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Check if completed
    if (updatedGoal.currentAmount >= updatedGoal.targetAmount && updatedGoal.status !== "Completed") {
      updatedGoal.status = "Completed";
      await updatedGoal.save();
    }

    res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error("Goal not found");
    }

    if (goal.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error("User not authorized");
    }

    await goal.deleteOne();
    res.status(200).json({ id: req.params.id, message: "Goal deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
