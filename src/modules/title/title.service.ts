import { Title } from "./title.model";
import { TitleVote } from "./titleVote.model";

export class TitleService {
  // Create title (student)
  static async createTitle(userId: string, data: any) {
    const normalizedTitle = data.titleName.trim().toLowerCase();

    // ✅ Check if already exists
    const existing = await Title.findOne({ normalizedTitle });

    if (existing) {
      throw new Error("Title already exists");
    }

    return await Title.create({
      ...data,
      normalizedTitle,
      createdBy: userId,
    });
  }

  // Get approved titles
  static async getApprovedTitles() {
    return await Title.find({
      status: "approved",
      isActive: true,
    });
  }

  // Vote (upvote/downvote)
  static async voteTitle(userId: string, titleId: string, voteType: string) {
    const existing = await TitleVote.findOne({ userId, titleId });

    if (existing) {
      // update vote
      if (existing.voteType !== voteType) {
        await TitleVote.updateOne({ _id: existing._id }, { voteType });

        if (voteType === "upvote") {
          await Title.findByIdAndUpdate(titleId, {
            $inc: { upvotesCount: 1, downvotesCount: -1 },
          });
        } else {
          await Title.findByIdAndUpdate(titleId, {
            $inc: { downvotesCount: 1, upvotesCount: -1 },
          });
        }
      }

      return { message: "Vote updated" };
    }

    await TitleVote.create({ userId, titleId, voteType });

    if (voteType === "upvote") {
      await Title.findByIdAndUpdate(titleId, {
        $inc: { upvotesCount: 1 },
      });
    } else {
      await Title.findByIdAndUpdate(titleId, {
        $inc: { downvotesCount: 1 },
      });
    }

    return { message: "Vote added" };
  }

  // ADMIN: approve title
  static async approveTitle(adminId: string, titleId: string) {
    return await Title.findByIdAndUpdate(titleId, {
      status: "approved",
      approvedBy: adminId,
      approvedAt: new Date(),
    },
    { returnDocument: "after" }
    );
  }

  // ADMIN: update title
  static async updateTitle(titleId: string, data: any) {
    // If titleName is being updated
    if (data.titleName) {
      const normalizedTitle = data.titleName.trim().toLowerCase();

      // Check for duplicates (excluding current title)
      const existing = await Title.findOne({
        normalizedTitle,
        _id: { $ne: titleId },
      });

      if (existing) {
        throw new Error("Title already exists");
      }

      // Add normalized field
      data.normalizedTitle = normalizedTitle;
    }

    return await Title.findByIdAndUpdate(titleId, data, {
      new: true,
    });
  }

  // ADMIN: soft delete
  static async deleteTitle(titleId: string) {
    return await Title.findByIdAndUpdate(
      titleId, 
      {isActive: false,},
      { returnDocument: "after" }
    );
  }

  // ADMIN: get all titles
  static async getAllTitles() {
    return await Title.find();
  }
}