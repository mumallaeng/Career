export const publicHighlightBasePath = '/import-data/highlight/';
export const publicDevStorageBasePath = '/import-data/dev-storage/';

export const legacyHighlightRemoteBasePath = 'Photos/Highlight/';
export const legacyDevStorageRemoteBasePath = 'Photos/dev-storage/';
export const legacyProjectsRemoteBasePath = 'Photos/Projects/';

export const authoritativeHighlightRemoteBasePath = 'media/photos/misc/Highlight/';
export const authoritativeDevStorageRemoteBasePath = 'media/photos/misc/dev-storage/';
export const authoritativeProjectsRemoteBasePath = 'media/photos/projects/';

export function remapLegacyRemotePath(remotePath: string): string {
  if (remotePath.startsWith(legacyDevStorageRemoteBasePath)) {
    return `${authoritativeDevStorageRemoteBasePath}${remotePath.slice(legacyDevStorageRemoteBasePath.length)}`;
  }

  if (remotePath.startsWith(legacyHighlightRemoteBasePath)) {
    return `${authoritativeHighlightRemoteBasePath}${remotePath.slice(legacyHighlightRemoteBasePath.length)}`;
  }

  if (remotePath.startsWith(legacyProjectsRemoteBasePath)) {
    return `${authoritativeProjectsRemoteBasePath}${remotePath.slice(legacyProjectsRemoteBasePath.length)}`;
  }

  return remotePath;
}
