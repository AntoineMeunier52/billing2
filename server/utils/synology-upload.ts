import { createClient, WebDAVClient } from "webdav";
import fs from "node:fs";
import path from "node:path";

interface SynologyUploadConfig {
  enabled: boolean;
  url: string;
  username: string;
  password: string;
  basePath: string;
}

interface UploadResult {
  success: boolean;
  remotePath?: string;
  error?: string;
}

/**
 * Get Synology WebDAV configuration from environment variables
 */
function getSynologyConfig(): SynologyUploadConfig | null {
  const enabled = process.env.SYNOLOGY_UPLOAD_ENABLED === "true";

  if (!enabled) {
    return null;
  }

  const url = process.env.SYNOLOGY_WEBDAV_URL;
  const username = process.env.SYNOLOGY_WEBDAV_USER;
  const password = process.env.SYNOLOGY_WEBDAV_PASSWORD;
  const basePath = process.env.SYNOLOGY_WEBDAV_PATH || "/invoices";

  if (!url || !username || !password) {
    console.warn(
      "⚠️  Synology upload enabled but missing credentials. Skipping upload."
    );
    return null;
  }

  return {
    enabled,
    url,
    username,
    password,
    basePath,
  };
}

/**
 * Create WebDAV client for Synology
 */
function createSynologyClient(config: SynologyUploadConfig): WebDAVClient {
  return createClient(config.url, {
    username: config.username,
    password: config.password,
  });
}

/**
 * Ensure directory exists on Synology (create if needed)
 */
async function ensureDirectory(
  client: WebDAVClient,
  dirPath: string
): Promise<void> {
  try {
    const exists = await client.exists(dirPath);
    if (!exists) {
      await client.createDirectory(dirPath, { recursive: true });
      console.log(`✅ Created directory on Synology: ${dirPath}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Upload a file to Synology with retry logic
 */
export async function uploadToSynology(
  localFilePath: string,
  remoteFileName: string,
  remoteSubPath: string = ""
): Promise<UploadResult> {
  const config = getSynologyConfig();

  // If Synology upload is disabled or not configured, skip
  if (!config) {
    return { success: false, error: "Synology upload not configured" };
  }

  try {
    // Check if local file exists
    if (!fs.existsSync(localFilePath)) {
      return { success: false, error: "Local file does not exist" };
    }

    // Create WebDAV client
    const client = createSynologyClient(config);

    // Build remote path
    const remoteDirPath = remoteSubPath
      ? `${config.basePath}/${remoteSubPath}`.replace(/\/+/g, "/")
      : config.basePath;

    const remoteFilePath = `${remoteDirPath}/${remoteFileName}`.replace(
      /\/+/g,
      "/"
    );

    // Ensure remote directory exists
    await ensureDirectory(client, remoteDirPath);

    // Read local file
    const fileContent = fs.readFileSync(localFilePath);

    // Upload file with retry logic (max 3 attempts)
    let uploadSuccess = false;
    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await client.putFileContents(remoteFilePath, fileContent, {
          overwrite: true,
        });
        uploadSuccess = true;
        console.log(
          `✅ Uploaded to Synology: ${remoteFilePath} (attempt ${attempt}/${maxRetries})`
        );
        break;
      } catch (error: any) {
        lastError = error;
        console.warn(
          `⚠️  Upload attempt ${attempt}/${maxRetries} failed: ${error.message}`
        );
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff: 1s, 2s, 4s)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
          );
        }
      }
    }

    if (!uploadSuccess) {
      return {
        success: false,
        error: `Upload failed after ${maxRetries} attempts: ${lastError?.message}`,
      };
    }

    return {
      success: true,
      remotePath: remoteFilePath,
    };
  } catch (error: any) {
    console.error("❌ Synology upload error:", error);
    return {
      success: false,
      error: error.message || "Unknown error during upload",
    };
  }
}

/**
 * Check if Synology upload is enabled
 */
export function isSynologyUploadEnabled(): boolean {
  return getSynologyConfig() !== null;
}
