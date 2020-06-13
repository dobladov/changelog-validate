const fs = require('fs');
const core = require('@actions/core');
const {context, GitHub} = require('@actions/github');
// const { graphql } = require("@octokit/graphql");

const {validateChangelog} = require('./validate');
const ingnoreActionMessage = `-Changelog` // ToDo: make it customizable

try {
  core.debug(`The event context: ${JSON.stringify(context, undefined, 2)}`);

  console.log(context.payload.pull_request)

  // const commitsIDs = context.commits()

  // const client = new GitHub(core.getInput('token', {required: true}));

  // const { repository } = await graphql(
  //   `
  //     {
  //       repository(owner: "octokit", name: "graphql.js") {
  //         issues(last: 3) {
  //           edges {
  //             node {
  //               title
  //             }
  //           }
  //         }
  //       }
  //     }
  //   `,
  //   {
  //     headers: {
  //       authorization: token,
  //     },
  //   }
  // );



  // const response = await client.repos.compareCommits({
  //   base,
  //   head,
  //   owner: context.repo.owner,
  //   repo: context.repo.repo
  // })

  console.log(response)

  const CHANGELOGS = JSON.parse(core.getInput('changelogs'))

  // Not do anything if -Changelog is a commit message
  const ignoreAction = context.payload.commits.some(commit => commit.message === ingnoreActionMessage)
  if (ignoreAction) {
    console.log(`Exit the action due to message with ${ingnoreActionMessage}`)
    process.exit(0)
  }

  CHANGELOGS.forEach(changelog => {
    // For each watchFolder check if it has modified files
      // If it has, verify the changelog
      // If is not modified warn it

    const changelogContent = fs.readFileSync(changelog.file, { encoding: 'utf-8' });
    validateChangelog(changelogContent);
  })
} catch (error) {
  core.setFailed(error.message);
}