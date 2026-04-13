export const legacyHighlightRemoteBasePath = 'Photos/Highlight/';
export const legacyDevStorageRemoteBasePath = 'Photos/dev-storage/';
export const legacyProjectRemoteBasePath = 'Photos/Projects/';

export const authoritativeHighlightRemoteBasePath = 'media/photos/misc/Highlight/';
export const authoritativeDevStorageRemoteBasePath = 'media/photos/misc/dev-storage/';
export const authoritativeProjectRemoteBasePath = 'media/photos/projects/';

export function remapLegacyOneDriveRemotePath(remotePath: string): string {
  if (remotePath.startsWith(legacyProjectRemoteBasePath)) {
    return `${authoritativeProjectRemoteBasePath}${remotePath.slice(legacyProjectRemoteBasePath.length)}`;
  }
  if (remotePath.startsWith(legacyHighlightRemoteBasePath)) {
    return `${authoritativeHighlightRemoteBasePath}${remotePath.slice(legacyHighlightRemoteBasePath.length)}`;
  }
  if (remotePath.startsWith(legacyDevStorageRemoteBasePath)) {
    return `${authoritativeDevStorageRemoteBasePath}${remotePath.slice(legacyDevStorageRemoteBasePath.length)}`;
  }
  return remotePath;
}

export function buildHighlightRemotePath(filename: string): string {
  return `${authoritativeHighlightRemoteBasePath}${filename}`;
}

export function buildDevStorageRemotePath(size: 'thumb' | 'default', filename: string): string {
  if (size === 'thumb') {
    return `${authoritativeDevStorageRemoteBasePath}thumb/${filename}`;
  }
  return `${authoritativeDevStorageRemoteBasePath}${filename}`;
}
