const github = require("@actions/github");
const core = require("@actions/core");
const fs = require("fs");

async function run() {
    try {
        const octokit = github.getOctokit(process.env.GITHUB_SECRET)

        const {owner: currentOwner, repo: currentRepo} = github.context.repo;

        const tagName = core.getInput('tag_name', {required: true});

        // This removes the 'refs/tags' portion of the string, i.e. from 'refs/tags/v1.10.15' to 'v1.10.15'
        const tag = tagName.replace('refs/tags/', '');
        const releaseName = core.getInput('release_name', {required: false}).replace('refs/tags/', '');
        const prerelease = core.getInput('prerelease', {required: false}) === 'true';

        const owner = core.getInput('owner', {required: false}) || currentOwner;
        const repo = core.getInput('repo', {required: false}) || currentRepo;

        // Create a release
        // API Documentation: https://developer.github.com/v3/repos/releases/#create-a-release
        // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-create-release
        const createReleaseResponse = await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name: tag,
            name: releaseName,
            prerelease,
        });

        // Get the ID, html_url, and upload URL for the created Release from the response
        const {
            data: {id: releaseId, html_url: htmlUrl, upload_url: uploadUrl}
        } = createReleaseResponse;

        // Set the output variables for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
        core.setOutput('id', releaseId);
        core.setOutput('html_url', htmlUrl);
        core.setOutput('upload_url', uploadUrl);
    } catch
        (error) {
        core.setFailed(error.message);
    }
}
(async () => {
    await run();
})();