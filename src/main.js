const github = require("@actions/github");
const core = require("@actions/core");

async function run() {
    try {
        const gitHubSecret = core.getInput("github_secret")

        if (!gitHubSecret) {
            core.setFailed(`No github secret found`)
            return
        }

        const octokit = github.getOctokit(gitHubSecret)
        const {owner: currentOwner, repo: currentRepo} = github.context.repo;
        console.log(`Owner: ${currentOwner}, Repo: ${currentRepo}`)

        const tagName = core.getInput('tag', {required: true});

        if (!tagName) {
            core.setFailed(`Tag not provided`)
            return;
        }

        const releaseName = core.getInput('release_name', {required: false});
        const prerelease = core.getInput('prerelease', {required: false}) === 'true';

        let createReleaseResponse = null;

        try {
            createReleaseResponse = await octokit.rest.repos.createRelease({
                owner: currentOwner,
                repo: currentRepo,
                tag_name: tagName,
                name: releaseName ?? `Release ${tagName}`,
                prerelease: prerelease,
            });
        } catch (e) {
            core.setFailed(`Could not create release for repo: ${e.message}`)
            return
        }
        // Get the ID, html_url, and upload URL for the created Release from the response
        const {
            data: {
                id: releaseId,
                html_url: htmlUrl,
                upload_url: uploadUrl
            }
        } = createReleaseResponse;

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