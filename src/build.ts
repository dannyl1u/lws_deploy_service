const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

export async function buildReactProject(id: string) {
    console.log(`Building project ${id}`);
    const projectPath = path.join(__dirname, `../dist/output/${id}`);

    // install dependencies
    console.log(`Installing dependencies for project ${id}`);
    await execAsync(`npm install`, { cwd: projectPath });

    // build the project
    console.log(`Building project ${id}`);
    await execAsync(`npm run build`, { cwd: projectPath });
    console.log(`Project ${id} built`);
}