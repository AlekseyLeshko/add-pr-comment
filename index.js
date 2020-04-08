const core = require("@actions/core");
const github = require("@actions/github");
const { HttpClient, Headers } = require("@actions/http-client");

const previewHeader = "application/vnd.github.groot-preview+json";

const getPulls = async (repoToken, repo, commitSha) => {
  const http = new HttpClient("http-client-add-pr-comment");

  const additionalHeaders = {
    [Headers.Accept]: previewHeader,
    [Headers.Authorization]: `token ${repoToken}`,
  };

  core.debug(`https://api.github.com/repos/${repo}/commits/${commitSha}/pulls`);

  const response = await http.getJson(
    `https://api.github.com/repos/${repo}/commits/${commitSha}/pulls`,
    additionalHeaders
  );

  const body = await response.readBody();

  core.debug(JSON.stringify(body));

  return body;
};

async function run() {
  try {
    const message = core.getInput("message");
    const repoToken = core.getInput("repo-token");
    const allowRepeats = Boolean(core.getInput("allow-repeats") === "true");

    core.debug(`input message: ${message}`);
    core.debug(`input allow-repeats: ${allowRepeats}`);

    const {
      payload: { pull_request: pullRequest, sha, repository },
    } = github.context;

    core.debug(JSON.stringify(github.context));
    core.debug(JSON.stringify(pullRequest));
    core.debug(`sha: ${sha}`);

    const { full_name: repoFullName } = repository;

    let issueNumber;

    if (pullRequest && pullRequest.number) {
      issueNumber = pullRequest.number;
    } else {
      // If this is not a pull request, attempt to find a PR matching the sha
      const pulls = await getPulls(repoToken, repoFullName, sha);
      issueNumber = pulls.length ? pulls[0].number : null;
    }

    if (!issueNumber) {
      core.warning(
        "this action only works on pull_request events or other commits associated with a pull"
      );
      core.setOutput("comment-created", "false");
      return;
    }

    const [owner, repo] = repoFullName.split("/");

    const octokit = new github.GitHub(repoToken);

    if (allowRepeats === false) {
      core.debug("repeat comments are disallowed, checking for existing");

      const { data: comments } = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
      });

      const filteredComments = comments.filter(
        (c) => c.body === message && c.user.login === "github-actions[bot]"
      );

      if (filteredComments.length) {
        core.warning("the issue already contains this message");
        core.setOutput("comment-created", "false");
        return;
      }
    }

    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: message,
    });

    core.setOutput("comment-created", "true");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
