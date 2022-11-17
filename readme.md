# Action: Create release for tag

Will create a release on the main branch of the repository.

## Inputs

### `token`

**Required** The secret used to access github

### `tag`

**Required** The tag used by the release

### `release_name`

The name of the release (Default `Release {tag}`)

### `prerelease`

If true, the created release will be marked as a pre-release (Default `false`)


## Outputs

### id

Id of the release by GitHub

### html_url

URL of the release by GitHub (html page)

### upload_url

URL of the release by GitHub (download link to the package)

## Example usage

Get the version from `package.json` and create a release with that version.

```yaml
- name: get-npm-version
  uses: jaywcjlove/github-action-package@main
  id: package-info
- name: create-release
  uses: freight-hub/action-create-release@v1
  with:
     tag: ${{ steps.package-info.outputs.version }}
     token: ${{ secrets.GITHUB_TOKEN }}
```


Use it in combination with the bump action to create a release from the new version

```yaml
- name: Bump version from tag
  id: tag
  uses: freight-hub/action-tag-bump-version@v1.3
  with:
     token: ${{ secrets.GITHUB_TOKEN }}
     build_number: ${{ github.run_number }}
     fallback_tag: 0.0.1
     disable_inform: false
- name: create-release
  uses: freight-hub/action-create-release@v1
  with:
     tag: ${{ steps.tag.outputs.new_version }}
     token: ${{ secrets.GITHUB_TOKEN }}
```

## Contributing

When contributing to this library there are some points to note:

1. Please run `yarn format` & `yarn build` BEFORE pushing to the repository.
2. The `dist` folder is checked in (we compile the node_modules into it with `@vercel/ncc`)
    - this is because we need to include the complete script in the repository for github
3. Please keep this readme up to date
3. After you have comitted, you can tag the repository to 'build' a new version for use in actions