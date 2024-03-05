import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "path";

const storage = new Storage({
    projectId:   'cmpt471',
    keyFilename: './cloud_credentials.json'
});

const bucketName = "lws-bucket-1";

export async function downloadGCSFolder(prefix: string) {
    console.log(prefix);
    const [files] = await storage.bucket(bucketName).getFiles({ prefix });

    // download folder to local /dist/prefix
    for (const file of files) {
        // create directory if it doesn't exist
        const destination = path.join(__dirname, `../dist/${file.name}`);
        const dir = path.dirname(destination);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // download the file
        try {
            await file.download({ destination });
            console.log(`Downloaded ${file.name} to ${destination}`);
        } catch (err) {
            console.error(`Failed to download ${file.name}:`, err);
        }
    }
}

export async function uploadBuildOutput(id: string) {
    const folderPath = path.join(__dirname, `../dist/${id}/build`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    });
    console.log(`Uploaded build output for project ${id}`);
}

const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

async function uploadFile(fileName: string, localFilePath: string) {
    try {
        const fileContent = await fs.promises.readFile(localFilePath);
        // upload file
        await storage.bucket(bucketName).file(fileName).save(fileContent, {
            metadata: {
                contentType: 'auto' // This will attempt to automatically set the correct contentType.
            }
        });
        console.log(`Uploaded ${fileName} to bucket ${bucketName}`);
    } catch (err) {
        console.error(`Failed to upload ${fileName}:`, err);
    }
}
