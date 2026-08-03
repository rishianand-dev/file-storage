import { env } from "@/config";
import app from "@/app";

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  console.log(`API docs at http://localhost:${env.port}/api-docs`);
});
