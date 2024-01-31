#!/usr/bin/env node

const fastify = require("fastify");
const fastifyStatic = require("@fastify/static");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs-extra");
const app = fastify();
const constants = require("../common/constants.js");
const DATA_DIR = constants.DATA_DIR;
const RAW_DIR = constants.RAW_DIR;

app.register(fastifyStatic, {
  root: path.join(__dirname, ".."),
  prefix: "/",
});

app.register(fastifyStatic, {
  root: DATA_DIR,
  prefix: DATA_DIR,
  decorateReply: false,
});

async function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        console.log(`${command} output: ${stdout}`);
        resolve();
      }
    });
  });
}

app.post("/saveJson", async (request, reply) => {
  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true });
  }

  const fileName = `${RAW_DIR}/${request.body.session}.json`;

  try {
    await fs.writeFile(fileName, JSON.stringify(request.body), "utf8");
    console.log("File saved successfully:", fileName);
    reply.code(200).send({ message: "File saved successfully" });
  } catch (err) {
    console.error("Error saving file:", err);
    reply.code(500).send({ error: "Internal Server Error" });
  }
});

app.post("/train", async (request, reply) => {
  const nodeFiles = path.join(process.cwd(), 'nodeExec');
  try {
    await execAsync(`${nodeFiles}/dataset_generator.js`);
    await execAsync(`${nodeFiles}/feature_extractor.js`);
    await execAsync(`${nodeFiles}/run_evaluation.js`);
    console.log("Training scripts executed successfully");
    reply.code(200).send({
      success: true,
      message: "Training scripts executed successfully",
    });
  } catch (err) {
    console.error("Error executing training scripts:", err);
    reply
      .code(500)
      .send({ success: false, error: err.message || "Internal Server Error" });
  }
});

app.post("/clearAllData", async (request, reply) => {
  const directoryPath = RAW_DIR;

  try {
    await fs.emptyDir(directoryPath);
    console.log("Data directory cleared successfully.");
    reply.code(200).send({ message: "Data directory cleared successfully" });
  } catch (err) {
    console.error("Error clearing data directory:", err);
    reply.code(500).send({ error: "Internal Server Error" });
  }
});

app.get("/", async (req, reply) => {
  const html = fs.readFileSync(
    path.join(__dirname, "../web/creator.html"),
    "utf-8",
  );
  return reply.status(200).type("text/html").send(html);
});

app.get("/test", async (req, reply) => {
  const html = fs.readFileSync(
    path.join(__dirname, "../web/viewer.html"),
    "utf-8",
  );
  return reply.status(200).type("text/html").send(html);
});

module.exports = async function handler(req, reply) {
  await app.ready();
  app.server.emit("request", req, reply);
};

app
  .listen({ port: 4000, host: "0.0.0.0" })
  .then((address) => console.log(`Server On`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
