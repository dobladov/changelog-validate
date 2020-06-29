const fs = require('fs');
const core = require('@actions/core');
const { context, getOctokit } = require('@actions/github');

const { validateChangelog } = require('./validate');
const { getModifiedFiles } = require('./files');

const run = async () => {
  try {
    const token = core.getInput('token', { required: true });
    const changelogs = JSON.parse(core.getInput('changelogs', { required: true }));
    const ingnoreActionMessage = core.getInput('ignoreActionMessage');
    const octokit = getOctokit(token);

    const repo = context.payload.repository.name;
    const owner = context.payload.repository.full_name.split('/')[0];
    const pullNumber = context.payload.pull_request.number;
    const labels = context.payload.pull_request.labels.map((label) => label.name);

    // Ignore the action if -Changelog label (or custom name) exists
    if (labels.includes(ingnoreActionMessage)) {
      core.info(`Ignore the action due to label ${ingnoreActionMessage}`);
      process.exit(0);
    }

    const modifiedFiles = await getModifiedFiles(octokit, repo, owner, pullNumber);

    changelogs.forEach((changelog) => {
      // Check if at least one file was modified in the watchFolder
      if (modifiedFiles.some((filename) => filename.startsWith(changelog.watchFolder))) {
        // Check if changelog is in the modified files
        if (!modifiedFiles.includes(changelog.file)) {
          core.setFailed(`Files in ${changelog.watchFolder} have been modified but ${changelog.file} was not modified`);
        }
      }

      const changelogContent = fs.readFileSync(changelog.file, { encoding: 'utf-8' });
      validateChangelog(changelogContent);
    });
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
  }
};

run();
