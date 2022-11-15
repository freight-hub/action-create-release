const github = require("@actions/github");
const core = require("@actions/core");
const semver = require("semver");

const validLevels = ['major', 'minor', 'patch']

async function run() {
    try {
        const gitHubSecret = core.getInput("github_secret")

        // setup
        if (!gitHubSecret) {
            core.setFailed(`No github secret found`)
            return
        }

        const octokit = github.getOctokit(gitHubSecret)
        const {owner: currentOwner, repo: currentRepo} = github.context.repo;
        console.log(`Owner: ${currentOwner}, Repo: ${currentRepo}`)

        const level = core.getInput("level")
        if (validLevels.indexOf(level) === -1) {
            core.setFailed(`Not a valid level. Must be one of: ${validLevels.join(", ")}`)
            return;
        }
        console.log(`Level: ${level}`)


        let buildNumber = core.getInput("build_number", {required: false})

        if (!buildNumber) {
            buildNumber = 0
        }
        console.log(`buildNumber: ${buildNumber}`)

        let tags = []
        try {
            // get tags
            tags = await octokit.rest.repos.listTags({
                owner: currentOwner,
                repo: currentRepo,
                per_page: 1,
                page: 1
            });
        } catch (e) {
            core.setFailed(`Could not fetch tags for repo.`)
            return
        }
        console.log(tags)

        const tag = tags[0]
        console.log(tag)


        if (!semver.valid(tag)) {
            core.setFailed(`${tag} is not a valid version`)
            return;
        }

        const newVersion = semver.inc(tag, level)
        core.setOutput("old_version", tag)
        core.setOutput("new_version", newVersion)
        core.setOutput("pre_release_version", `${newVersion}-alpha.${buildNumber}`)

    } catch
        (error) {
        core.setFailed(error.message);
    }
}

(async () => {
    await run();
})();