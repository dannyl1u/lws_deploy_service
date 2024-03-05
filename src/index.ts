import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs/promises";
import { downloadGCSFolder, uploadBuildOutput } from "./gcs";
import { commandOptions, createClient } from "redis";
import { buildReactProject } from "./build";

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

async function main() {
    while(1) {
        const response = await subscriber.brPop(
            commandOptions({ isolated: true }),
            'build-queue',
            0
        );
        console.log(response);
        // @ts-ignore
        const id = response.element;
        await downloadGCSFolder(`output/${response?.element}/`);
        await buildReactProject(id);
        await uploadBuildOutput(`output/${response?.element}`);
        subscriber.hSet("status", id, "deployed");
    }
}

main();

app.listen(8001, () => console.log("Server running on port 8001"));