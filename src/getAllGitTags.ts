import { getExecOutput } from '@actions/exec';
import { valid } from 'semver';

export async function getAllGitTags() {
  const tagOutput = await getExecOutput('git', ['tag'], { silent: true });

  const allTags = tagOutput.stdout.split('\n');
  const versionTags = allTags.filter((tag) => valid(tag));
  return versionTags;
}
