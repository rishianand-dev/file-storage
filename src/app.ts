import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { setupSwagger } from "@/docs";
import { errorHandler } from "@/middleware";
import routes from "@/routes";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

app.use("/api", routes);

app.use(errorHandler);

export default app;
