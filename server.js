import express from "express";
import cors from "cors";
import { prisma } from "./src/db.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

function isValidEmail(email) {
  return typeof email === "string" && email.includes("@") && email.includes(".");
}

app.get("/health", (req, res) => {
  res.json({ 
    ok: true, 
    service: "saas-node-api",
    version:"1.0.0"
  });
});

app.get("/api/applications", async (req, res) => {
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json({
    count: applications.length,
    data: applications,
  });
});

app.post("/api/applications", async (req, res) => {
  const { name, email, goal } = req.body;

  if (!name || !email || !goal) {
    return res.status(400).json({ error: "name、email、goal 都必须填写" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "邮箱格式不正确" });
  }

  const record = await prisma.application.create({
    data: {
      name,
      email,
      goal,
    },
  });

  res.status(201).json({
    message: "申请已写入数据库",
    data: record,
  });
});

app.listen(port, () => {
  console.log(`SaaS API running at http://localhost:${port}`);
});
