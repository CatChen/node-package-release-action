import { warning } from '@actions/core';
import { rsort } from 'semver';
import { getAllGitTags } from './getAllGitTags.js';

export async function getLastGitTag() {
  const versionTags = await getAllGitTags();
  if (versionTags.length === 0) {
    warning(`No tag found.`);
    return null;
  }
  const sortedTags = rsort(versionTags);
  const lastTag = sortedTags[0];
  return lastTag;
}
