import fs from "fs";
import csv from "csv-parser";
import { User } from "./user.model";

export class UserService {

  static async processCSV(filePath: string) {
    const users: any[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => users.push(row))
        .on("end", async () => {
          let added = 0;
          let skipped = 0;

          for (const u of users) {
            const exists = await User.findOne({ usn: u.usn });

            if (exists) {
              skipped++;
              continue;
            }

            await User.create({
              name: u.name,
              usn: u.usn,
              email: u.email,
            });

            added++;
          }

          resolve({ added, skipped });
        })
        .on("error", reject);
    });
  }

  // Get approved titles
  static async getAllUsers() {
    return await User.find({
      role: "student",
    });
  }
}