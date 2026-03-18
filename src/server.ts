import dotenv from "dotenv";
dotenv.config();
import { SystemConfig } from "./models/systemConfig.model";

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

const initializeConfig = async () => {
  const existing = await SystemConfig.findOne();

  if (!existing) {
    await SystemConfig.create({
      currentPhase: "final_voting",
      isVotingOpen: true,
    });
    console.log("SystemConfig initialized");
  }
};

connectDB().then(() => {
  initializeConfig();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});