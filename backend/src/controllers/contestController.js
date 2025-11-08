import mongoose from "mongoose";
import Contest from "../models/contest.js";
import Problem from "../models/problem.js";
import User from "../models/user.js";

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

    const userRole = req.user?.role;
    const isAdmin = userRole === 'admin';
    if (!contest.isPublic && contest.creator.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const now = new Date();
    let status = "upcoming";
    if (contest.startTime <= now && contest.endTime >= now) {
      status = "ongoing";
    } else if (contest.endTime < now) {
      status = "ended";
    }

    const contestObj = contest.toObject();
    contestObj.status = status;
    
    const userIdStr = userId?.toString();
    
    let creatorIdStr = null;
    if (contest.creator) {
      if (contest.creator._id) {

        creatorIdStr = contest.creator._id.toString();
      } else {

        creatorIdStr = contest.creator.toString();
      }
    }
    
    const isCreator = creatorIdStr === userIdStr;
    
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
      participants: [userId],
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

export async function joinContest(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const userRole = req.user?.role;
    const isAdmin = userRole === 'admin';
    if (!contest.isPublic && contest.creator.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

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

export async function getContestCreationCount(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const count = await Contest.countDocuments({
      creator: userId,
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    const user = await User.findById(userId).select('subscription');
    const hasActiveSubscription = user?.subscription?.isActive && 
      user.subscription.expiryDate && 
      new Date() <= new Date(user.subscription.expiryDate);
    
    const maxContests = 5;
    const freeContests = 4;
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

export async function createPersonalContest(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { title, description, problems } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    if (!problems || !Array.isArray(problems) || problems.length !== 4) {
      return res.status(400).json({ message: "Exactly 4 problems must be selected" });
    }

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

    const maxContests = 5;
    const freeContests = 4;
    
    if (contestsThisMonth >= maxContests) {
      return res.status(403).json({ 
        message: `You have reached the monthly limit of ${maxContests} contests. Please wait until next month to create more contests.`,
        limitReached: true
      });
    }

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

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 90 * 60 * 1000);

    const contest = new Contest({
      title: title.trim(),
      description: description.trim(),
      startTime,
      endTime,
      problems: validProblemIds,
      creator: userId,
      isPublic: false,
      participants: [userId],
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
