import mongoose from "mongoose";
import Contest from "../models/contest.js";
import Problem from "../models/problem.js";
import User from "../models/user.js";

// Get all contests (user can see public contests and their own contests)
export async function getAllContests(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {
      $or: [
        { isPublic: true },
        { creator: userId }
      ]
    };

    if (status) {
      const now = new Date();
      if (status === "upcoming") {
        query.startTime = { $gt: now };
      } else if (status === "ongoing") {
        query.startTime = { $lte: now };
        query.endTime = { $gte: now };
      } else if (status === "ended") {
        query.endTime = { $lt: now };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const contests = await Contest.find(query)
      .populate('creator', 'firstName lastName emailId')
      .populate('problems', 'title difficulty')
      .populate('participants', '_id')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Update status and check participant status for each contest
    const now = new Date();
    const userIdStr = userId?.toString();
    const userRole = req.user?.role;
    const isAdmin = userRole === 'admin';
    const contestsWithStatus = contests.map(contest => {
      const contestObj = contest.toObject();
      if (contestObj.startTime > now) {
        contestObj.status = "upcoming";
      } else if (contestObj.endTime < now) {
        contestObj.status = "ended";
      } else {
        contestObj.status = "ongoing";
      }
      
      // Check if user is participant - creator is automatically a participant
      // Admins also have automatic access to all contests
      const creatorIdStr = contest.creator?._id?.toString() || contest.creator?.toString();
      const isCreator = creatorIdStr === userIdStr;
      const isParticipant = isAdmin || isCreator || contest.participants.some(p => {
        const participantId = p?._id?.toString() || p?.toString();
        return participantId === userIdStr;
      });
      contestObj.isParticipant = isParticipant;
      
      return contestObj;
    });

    const total = await Contest.countDocuments(query);

    res.json({
      contests: contestsWithStatus,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ message: "Failed to fetch contests" });
  }
}

// Get contest by ID
export async function getContestById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const contest = await Contest.findById(id)
      .populate('creator', 'firstName lastName emailId')
      .populate('problems', 'title description difficulty tags visibleTestCases starterCode constraints')
      .populate('participants', 'firstName lastName emailId');

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Check if user has access - admins have access to all contests
    const userRole = req.user?.role;
    const isAdmin = userRole === 'admin';
    if (!contest.isPublic && contest.creator.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update status
    const now = new Date();
    let status = "upcoming";
    if (contest.startTime <= now && contest.endTime >= now) {
      status = "ongoing";
    } else if (contest.endTime < now) {
      status = "ended";
    }

    const contestObj = contest.toObject();
    contestObj.status = status;
    
    // Check if user is participant - creator is automatically a participant
    // Admins also have automatic access to all contests
    const userIdStr = userId?.toString();
    
    // Get creator ID - handle both populated (object with _id) and unpopulated (ObjectId) cases
    let creatorIdStr = null;
    if (contest.creator) {
      if (contest.creator._id) {
        // Populated - it's a document object
        creatorIdStr = contest.creator._id.toString();
      } else {
        // Unpopulated - it's an ObjectId
        creatorIdStr = contest.creator.toString();
      }
    }
    
    const isCreator = creatorIdStr === userIdStr;
    
    // Check participants (handle both populated and unpopulated cases)
    const participantsArray = contest.participants || [];
    const isInParticipants = participantsArray.length > 0 && participantsArray.some(p => {
      const participantId = p?._id?.toString() || p?.toString();
      return participantId === userIdStr;
    });
    
    const isParticipant = isAdmin || isCreator || isInParticipants;
    
    contestObj.isParticipant = isParticipant;

    res.json({ contest: contestObj });
  } catch (error) {
    console.error("Error fetching contest:", error);
    res.status(500).json({ message: "Failed to fetch contest" });
  }
}

// Create contest (admin only)
export async function createContest(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { title, description, startTime, endTime, problems, isPublic = true } = req.body;

    if (!title || !description || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // Validate problems exist
    if (problems && problems.length > 0) {
      const validProblems = await Problem.find({ _id: { $in: problems } });
      if (validProblems.length !== problems.length) {
        return res.status(400).json({ message: "Some problems not found" });
      }
    }

    const contest = new Contest({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      problems: problems || [],
      creator: userId,
      isPublic,
      participants: [userId], // Creator is automatically a participant
    });

    await contest.save();
    await contest.populate('creator', 'firstName lastName emailId');
    await contest.populate('problems', 'title difficulty');

    res.status(201).json({ 
      message: "Contest created successfully",
      contest 
    });
  } catch (error) {
    console.error("Error creating contest:", error);
    res.status(500).json({ message: "Failed to create contest" });
  }
}

// Update contest (admin only)
export async function updateContest(req, res) {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, problems, isPublic } = req.body;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    if (title) contest.title = title;
    if (description) contest.description = description;
    if (startTime) contest.startTime = new Date(startTime);
    if (endTime) contest.endTime = new Date(endTime);
    if (problems !== undefined) {
      // Validate problems exist
      if (problems.length > 0) {
        const validProblems = await Problem.find({ _id: { $in: problems } });
        if (validProblems.length !== problems.length) {
          return res.status(400).json({ message: "Some problems not found" });
        }
      }
      contest.problems = problems;
    }
    if (isPublic !== undefined) contest.isPublic = isPublic;

    await contest.save();
    await contest.populate('creator', 'firstName lastName emailId');
    await contest.populate('problems', 'title difficulty');

    res.json({ 
      message: "Contest updated successfully",
      contest 
    });
  } catch (error) {
    console.error("Error updating contest:", error);
    res.status(500).json({ message: "Failed to update contest" });
  }
}

// Delete contest (admin only)
export async function deleteContest(req, res) {
  try {
    const { id } = req.params;

    const contest = await Contest.findByIdAndDelete(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    res.json({ message: "Contest deleted successfully" });
  } catch (error) {
    console.error("Error deleting contest:", error);
    res.status(500).json({ message: "Failed to delete contest" });
  }
}

// Join contest
export async function joinContest(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Check if user has access - admins have access to all contests
    const userRole = req.user?.role;
    const isAdmin = userRole === 'admin';
    if (!contest.isPublic && contest.creator.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if already joined
    if (contest.participants.includes(userId)) {
      return res.status(400).json({ message: "Already joined this contest" });
    }

    contest.participants.push(userId);
    await contest.save();

    res.json({ message: "Joined contest successfully" });
  } catch (error) {
    console.error("Error joining contest:", error);
    res.status(500).json({ message: "Failed to join contest" });
  }
}

// Get user's contests
export async function getMyContests(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { status } = req.query;

    const query = {
      $or: [
        { creator: userId },
        { participants: userId }
      ]
    };

    if (status) {
      const now = new Date();
      if (status === "upcoming") {
        query.startTime = { $gt: now };
      } else if (status === "ongoing") {
        query.startTime = { $lte: now };
        query.endTime = { $gte: now };
      } else if (status === "ended") {
        query.endTime = { $lt: now };
      }
    }

    const contests = await Contest.find(query)
      .populate('creator', 'firstName lastName emailId')
      .populate('problems', 'title difficulty')
      .populate('participants', '_id')
      .sort({ startTime: -1 });

    // Update status and set participant flag
    const now = new Date();
    const userIdStr = userId?.toString();
    const contestsWithStatus = contests.map(contest => {
      const contestObj = contest.toObject();
      if (contestObj.startTime > now) {
        contestObj.status = "upcoming";
      } else if (contestObj.endTime < now) {
        contestObj.status = "ended";
      } else {
        contestObj.status = "ongoing";
      }
      
      // Since these are user's contests (creator or participant), set isParticipant to true
      // Admins also have automatic access to all contests
      const userRole = req.user?.role;
      const isAdmin = userRole === 'admin';
      const creatorIdStr = contest.creator?._id?.toString() || contest.creator?.toString();
      const isCreator = creatorIdStr === userIdStr;
      const isParticipant = isAdmin || isCreator || contest.participants.some(p => {
        const participantId = p?._id?.toString() || p?.toString();
        return participantId === userIdStr;
      });
      contestObj.isParticipant = isParticipant;
      
      return contestObj;
    });

    res.json({ contests: contestsWithStatus });
  } catch (error) {
    console.error("Error fetching user contests:", error);
    res.status(500).json({ message: "Failed to fetch contests" });
  }
}

// Get user's contest creation count for current month
export async function getContestCreationCount(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    
    // Get start and end of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Count contests created by user this month
    const count = await Contest.countDocuments({
      creator: userId,
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    // Get user subscription status
    const user = await User.findById(userId).select('subscription');
    const hasActiveSubscription = user?.subscription?.isActive && 
      user.subscription.expiryDate && 
      new Date() <= new Date(user.subscription.expiryDate);
    
    const maxContests = 5; // Maximum contests per month
    const freeContests = 4; // Free contests before requiring subscription
    const remaining = Math.max(0, maxContests - count);
    const canCreateMore = count < maxContests;
    const requiresSubscription = count >= freeContests && !hasActiveSubscription;
    
    res.json({
      count,
      maxContests,
      remaining,
      canCreateMore,
      requiresSubscription,
      hasActiveSubscription
    });
  } catch (error) {
    console.error("Error getting contest creation count:", error);
    res.status(500).json({ message: "Failed to get contest creation count" });
  }
}

// Create personal contest (for regular users)
export async function createPersonalContest(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { title, description, problems } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // Validate exactly 4 problems
    if (!problems || !Array.isArray(problems) || problems.length !== 4) {
      return res.status(400).json({ message: "Exactly 4 problems must be selected" });
    }

    // Validate problems exist - use mongoose.Types.ObjectId for validation
    const validProblemIds = problems.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validProblemIds.length !== 4) {
      return res.status(400).json({ message: "Invalid problem IDs provided" });
    }

    const validProblems = await Problem.find({ _id: { $in: validProblemIds } });
    if (validProblems.length !== 4) {
      return res.status(400).json({ 
        message: `Some problems not found. Found ${validProblems.length} out of 4 problems.` 
      });
    }

    // Check monthly contest creation limit
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const contestsThisMonth = await Contest.countDocuments({
      creator: userId,
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    const maxContests = 5; // Maximum contests per month
    const freeContests = 4; // Free contests before requiring subscription
    
    if (contestsThisMonth >= maxContests) {
      return res.status(403).json({ 
        message: `You have reached the monthly limit of ${maxContests} contests. Please wait until next month to create more contests.`,
        limitReached: true
      });
    }

    // Check if subscription is required (after 4 contests)
    if (contestsThisMonth >= freeContests) {
      const user = await User.findById(userId).select('subscription');
      const hasActiveSubscription = user?.subscription?.isActive && 
        user.subscription.expiryDate && 
        new Date() <= new Date(user.subscription.expiryDate);
      
      if (!hasActiveSubscription) {
        return res.status(403).json({ 
          message: `You have created ${contestsThisMonth} contests this month. To create more contests (up to ${maxContests} per month), please subscribe to a premium plan.`,
          requiresSubscription: true,
          contestsCreated: contestsThisMonth,
          maxContests
        });
      }
    }

    // Set duration to 1.30 hours (90 minutes)
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 90 * 60 * 1000); // 90 minutes in milliseconds

    const contest = new Contest({
      title: title.trim(),
      description: description.trim(),
      startTime,
      endTime,
      problems: validProblemIds,
      creator: userId,
      isPublic: false, // Personal contests are private by default
      participants: [userId], // Creator is automatically a participant
    });

    await contest.save();
    await contest.populate('creator', 'firstName lastName emailId');
    await contest.populate('problems', 'title difficulty');

    res.status(201).json({
      message: "Personal contest created successfully",
      contest
    });
  } catch (error) {
    console.error("Error creating personal contest:", error);
    const errorMessage = error.message || "Failed to create personal contest";
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

