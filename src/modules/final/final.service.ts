import { Nomination } from "../nomination/nomination.model";
import { FinalNominee } from "./finalNominee.model";
import { Vote } from "./vote.model";
import { Result } from "./result.model";
import { SystemConfig } from "../../models/systemConfig.model";

export class FinalService {
  // 🔥 FINALIZE NOMINEES
  static async finalizeNominees() {
    const aggregation = await Nomination.aggregate([
      {
        $group: {
          _id: {
            titleId: "$titleId",
            nomineeId: "$nomineeId",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $group: {
          _id: "$_id.titleId",
          nominees: {
            $push: {
              userId: "$_id.nomineeId",
              count: "$count",
            },
          },
        },
      },
    ]);

    const results = [];

    for (const item of aggregation) {
      const top6 = item.nominees.slice(0, 6);

      const saved = await FinalNominee.create({
        titleId: item._id,
        nominees: top6,
        generatedAt: new Date(),
      });

      results.push(saved);
    }

    return results;
  }

  // 🗳️ CAST VOTE (FULL POLL)
  static async submitVotes(userId: string, votes: any[]) {
    const config = await SystemConfig.findOne();

    if (!config?.isVotingOpen) {
      throw new Error("Voting is closed");
    }

    const existing = await Vote.findOne({ userId });

    if (existing) {
      throw new Error("You have already submitted your vote");
    }

    const voteDocs = votes.map((v) => ({
      userId,
      titleId: v.titleId,
      nomineeId: v.nomineeId,
    }));

    await Vote.insertMany(voteDocs);

    return { message: "Vote submitted successfully" };
  }

  // 📊 ADMIN STATS
  static async getStats() {
    const totalVoters = await Vote.distinct("userId");

    const stats = await Vote.aggregate([
      {
        $group: {
          _id: {
            titleId: "$titleId",
            nomineeId: "$nomineeId",
          },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "titles",
          localField: "_id.titleId",
          foreignField: "_id",
          as: "title",
        },
      },
      { $unwind: "$title" },
      {
        $lookup: {
          from: "users",
          localField: "_id.nomineeId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$_id.titleId",
          title: { $first: "$title" },
          nominees: {
            $push: {
              name: "$user.name",
              count: "$count",
            },
          },
        },
      },
    ]);

    return {
      totalVoters: totalVoters.length,
      stats,
    };
  }

  // 🏆 FINAL RESULTS
  static async getResults() {
    const config = await SystemConfig.findOne();

    if (config?.isVotingOpen) {
      throw new Error("Results not available yet");
    }

    const results = await Result.find()
      .populate({
        path: "titleId",
        select: "titleName",
      })
      .populate({
        path: "winnerId",
        select: "name usn",
      });

    return results.map((r) => ({
      title: r.titleId,
      winner: r.winnerId,
      votes: r.voteCount,
    }));
  }

  static async getFinalNominees() {
    const data = await FinalNominee.find()
      .populate({
        path: "titleId",
        select: "_id titleName",
      })
      .populate({
        path: "nominees.userId",
        select: "_id name usn",
      });

    if (!data || data.length === 0) {
      throw new Error("Nominees not finalized yet");
    }

    // Clean response for frontend
    return data.map((item) => ({
      title: item.titleId,
      nominees: item.nominees.map((n) => ({
        user: n.userId,
        count: n.count, // optional (you can remove if not needed)
      })),
    }));
  }

  static async freezeVotingAndGenerateResults(adminId: string) {
    const config = await SystemConfig.findOne();

    if (!config?.isVotingOpen) {
      throw new Error("Voting already closed");
    }

    // 🔒 Close voting
    config.isVotingOpen = false;
    config.currentPhase = "results";
    await config.save();

    // 🏆 Calculate winners
    const aggregation = await Vote.aggregate([
      {
        $group: {
          _id: {
            titleId: "$titleId",
            nomineeId: "$nomineeId",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $group: {
          _id: "$_id.titleId",
          winner: { $first: "$_id.nomineeId" },
          voteCount: { $first: "$count" },
        },
      },
    ]);

    // 📝 Save results
    const results = [];

    for (const item of aggregation) {
      const saved = await Result.create({
        titleId: item._id,
        winnerId: item.winner,
        voteCount: item.voteCount,
        createdAt: new Date(),
      });

      results.push(saved);
    }

    return results;
  }
}