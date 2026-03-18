import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import titleRoutes from "./modules/title/title.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", userRoutes);
app.use("/api/titles", titleRoutes)

export default app;