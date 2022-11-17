const github = require('@actions/github')
const core = require('@actions/core')

async function run() {
    try {
        // -- Input
        const { repo, owner, prerelease, gitHubSecret, releaseName, tagName } = getAndValidateInput()

        // -- Action
        let release = await createRelease(gitHubSecret, owner, repo, tagName, releaseName, prerelease)

        // -- Output
        core.setOutput('id', release.id)
        core.setOutput('html_url', release.htmlUrl)
        core.setOutput('upload_url', release.uploadUrl)
    } catch (error) {
        core.setFailed(error.message)
    }
}

async function createRelease(gitHubSecret, owner, repo, tagName, releaseName, prerelease) {
    const octokit = github.getOctokit(gitHubSecret)

    try {
        const response = await octokit.rest.repos.createRelease({
            owner: owner,
            repo: repo,
            tag_name: tagName,
            name: releaseName ?? `Release ${tagName}`,
            prerelease: prerelease,
        })

        return {
            id: response.data.id,
            htmlUrl: response.data.html_url,
            uploadUrl: response.data.upload_url,
        }
    } catch (e) {
        throw new Error(`could not create release: ${e.message}`)
    }
}

function getAndValidateInput() {
    const gitHubSecret = core.getInput('token')
    if (!gitHubSecret) throw new Error(`No github secret found`)

    const tagName = core.getInput('tag', { required: true })
    if (!tagName) throw new Error(`No tag provided`)

    const releaseName = core.getInput('release_name', { required: false })
    const prerelease = core.getInput('prerelease', { required: false }) === 'true'
    const repo = github.context.repo

    return {
        owner: repo.owner,
        repo: repo.repo,
        gitHubSecret,
        tagName,
        releaseName,
        prerelease,
    }
}

;(async () => {
    await run()
})()
