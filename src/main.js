const github = require("@actions/github");
const core = require("@actions/core");
const semver = require("semver");

const validLevels = ['major', 'minor', 'patch']

async function run() {
    try {
        // setup
        if (!process.env.GITHUB_SECRET) {
            core.setFailed(`No github secret found`)
            return
        }

        const octokit = github.getOctokit(process.env.GITHUB_SECRET)
        const {owner: currentOwner, repo: currentRepo} = github.context.repo;

        const level = core.getInput("level")
        if (validLevels.indexOf(level) > -1) {
            core.setFailed(`Not a valid level. Must be one of: ${validLevels.join(", ")}`)
            return;
        }

        let buildNumber = core.getInput("build_number", {required: false})

        if (!buildNumber) {
            buildNumber = 0
        }

        // get tags
        const tags = octokit.rest.repos.listTags({
            currentOwner,
            currentRepo,
            page: 1,
            per_page: 1
        });
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