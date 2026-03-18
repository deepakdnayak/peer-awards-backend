import mongoose from "mongoose";
import { Nomination } from "./nomination.model";
import { Title } from "../title/title.model";

export class NominationService {
  // Create nomination
  static async createNomination(
    userId: string,
    titleId: string,
    nomineeId: string
  ) {
    const title = await Title.findById(titleId);

    if (!title || title.status !== "approved" || !title.isActive) {
      throw new Error("Invalid or inactive title");
    }

    const existing = await Nomination.findOne({
      titleId,
      nominatedBy: userId,
    });

    if (existing) {
      throw new Error("Nomination already exists. Use update API.");
    }

    return await Nomination.create({
      titleId,
      nominatedBy: userId,
      nomineeId,
    });
  }

  // Update nomination (overwrite)
  static async updateNomination(
    userId: string,
    titleId: string,
    nomineeId: string
  ) {
    const existing = await Nomination.findOne({
      titleId,
      nominatedBy: userId,
    });

    if (!existing) {
      throw new Error("No existing nomination found");
    }

    existing.nomineeId = new mongoose.Types.ObjectId(nomineeId);
    await existing.save();

    return existing;
  }

  // Get my nominations
  static async getMyNominations(userId: string) {
    return await Nomination.find({ nominatedBy: userId })
      .populate({
        path: "nomineeId",
        select: "_id name usn", // only required fields
      })
      .populate({
        path: "titleId",
        select: "_id titleName",
      });
  }

  // Admin: Top 6 nominees per title
  static async getTopNominees() {
    const result = await Nomination.aggregate([
      // Step 1: Count nominations
      {
        $group: {
          _id: {
            titleId: "$titleId",
            nomineeId: "$nomineeId",
          },
          count: { $sum: 1 },
        },
      },

      // Step 2: Sort by highest votes
      {
        $sort: { count: -1 },
      },

      // Step 3: Group by title
      {
        $group: {
          _id: "$_id.titleId",
          nominees: {
            $push: {
              nomineeId: "$_id.nomineeId",
              count: "$count",
            },
          },
        },
      },

      // Step 4: Limit top 6
      {
        $project: {
          titleId: "$_id",
          topNominees: { $slice: ["$nominees", 6] },
        },
      },

      // Step 5: Lookup Title details
      {
        $lookup: {
          from: "titles",
          localField: "titleId",
          foreignField: "_id",
          as: "title",
        },
      },
      { $unwind: "$title" },

      // Step 6: Lookup User details
      {
        $lookup: {
          from: "users",
          localField: "topNominees.nomineeId",
          foreignField: "_id",
          as: "nomineeDetails",
        },
      },

      // Step 7: Merge nominee details
      {
        $addFields: {
          topNominees: {
            $map: {
              input: "$topNominees",
              as: "nom",
              in: {
                count: "$$nom.count",
                user: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$nomineeDetails",
                        as: "user",
                        cond: {
                          $eq: ["$$user._id", "$$nom.nomineeId"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },

      // Optional cleanup
      {
        $project: {
          nomineeDetails: 0,
        },
      },
    ]);

    return result;
  }
}