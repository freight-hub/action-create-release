const core = require('@actions/core');
const github = require('@actions/github');

try {
    const ref = github.context.ref
    console.log(ref)
    const tagPath = 'refs/tags/'
    if (ref && ref.startsWith(tagPath)) {
        let tag = ref.substring(tagPath.length, ref.length)
        console.log(tag)
    }
} catch (error) {
    core.setFailed(error.message);
}