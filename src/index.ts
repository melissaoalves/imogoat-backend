import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(routes);

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
