# node-package-release-action

[![Build](https://github.com/CatChen/node-package-release-action/actions/workflows/build.yml/badge.svg?branch=main&event=push)](https://github.com/CatChen/node-package-release-action/actions/workflows/build.yml)
[![Test](https://github.com/CatChen/node-package-release-action/actions/workflows/test.yml/badge.svg?branch=main&event=push)](https://github.com/CatChen/node-package-release-action/actions/workflows/test.yml)
[![ESLint](https://github.com/CatChen/node-package-release-action/actions/workflows/eslint.yml/badge.svg?branch=main&event=push)](https://github.com/CatChen/node-package-release-action/actions/workflows/eslint.yml)
[![CodeQL](https://github.com/CatChen/node-package-release-action/actions/workflows/codeql.yml/badge.svg?branch=main&event=schedule)](https://github.com/CatChen/node-package-release-action/actions/workflows/codeql.yml)

Stop running `npm version patch` manually to release a new version of your NPM package. Let this Action automate for you. Trigger it on GitHub or schedule a weekly or monthly release.

## Examples

```yaml
name: Release

on:
  schedule:
    - cron: '0 12 * * 0' # every sunday noon

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - id: release
        uses: CatChen/node-package-release-action@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }} # optional
          directory: './' #optional
          release-type: prerelease # optional
          prerelease: false # optional
          update-shorthand-release: false
          skip-if-no-diff: false
          dry-run: false # optional

      - env:
          TAG: ${{ steps.release.outputs.tag }}
          SKIPPED: ${{ steps.release.outputs.skipped }}
        run: |
          if [[ "$SKIPPED"='true' ]]
          then
            echo 'Release is skipped.'
          else
            echo "Release $TAG successfully."
          fi
```

## Options

### `github-token`

The default value is `${{ github.token }}`, which is the GitHub token generated for this workflow. You can [create a different token with a different set of permissions](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) and use it here as well.

### `directory`

The default value is `"./"`. It's where the `package.json` locates.

### `release-type`

Which part of the [semver](https://semver.org/) should be increased for the next release. Valid inputs are `major`, `premajor`, `minor`, `preminor`, `patch`, `prepatch` and `prerelease`. The list of valid inputs is from [`semver.inc`](https://github.com/npm/node-semver#functions), which is used by the `npm version` command. The default value is `prerelease`. This is independent from the `prerelease` input.

### `prerelease`

This controls whether the GitHub Release should be marked as a prerelease. The default value is `false`. This is independent from the `release-type` input.

### `update-shorthand-release`

[GitHub Action documentation](https://docs.github.com/en/actions/creating-actions/about-custom-actions#using-tags-for-release-management) recommends updating shorthand releases like `v1` and `v1.2` when releasing the latest `v1.2.*`. Set this to `true` when using this Action to release other Actions. The default value is `false`.

### `skip-if-no-diff`

This controls whether this action should do nothing if there's no changes since last release of the same release type. If we release a minor upgrade to `1.2.3` or `1.2.4-0` it should be `1.2.4`. If `1.2.4` and `1.2.3` are the same and if `skip-if-no-diff` is set to `true`, `1.2.4` won't be created. `1.2.4-*` won't be used in the comparison. The default value is `false`.

### `diff-targets`

This controls the diff targets used with `skip-if-no-diff`. The default value is `"."`. For example, it could be `"{package.json,lib/**/*}"` for a typical TypeScript project with compiled files in the `lib` directory. Use glob pattern to match multiple directories if necessary, for example `"{src,lib}"` instead of `"src lib"` or `"{src, lib}"` to match both the `src` directory and the `lib` directory.

### `dry-run`

This controls whether this is a dry run. The default value is `false`. It's used for debugging only.

## Failure handling and cleanup

This Action now has a post step (`post-if: always()`) that performs best-effort cleanup when the main release flow fails.

- If a branch/tag push succeeds but GitHub Release creation fails, the post step attempts to roll back remote git state by deleting the release tag and resetting the branch to the original commit.
- If a GitHub Release was already created before the failure, the post step does not delete published artifacts automatically. Instead it prints explicit manual remediation commands in logs.
- In `dry-run` mode, no remote cleanup is attempted.

Cleanup commands use `--force-with-lease` and may fail if branch protection or concurrent pushes prevent rollback. In that case, follow the remediation commands printed in logs.

## FAQ

### How do all the `release-type` options work?

Let's start with the easy ones. `major`, `minor` and `patch` increase their corresponding part and reset the parts behind them to zero.

- `2.3.4` + `major` => `3.0.0`
- `2.3.4` + `minor` => `2.4.0`
- `2.3.4` + `patch` => `2.3.5`

`prerelease` is an interesting one. It increases the prerelease part if it exists. Otherwise, it increases the patch part and append a prerelease zero suffix.

- `2.3.4-0` + `prerelease` => `2.3.4-1`
- `2.3.4` + `prerelease` => `2.3.5-0`

`premajor`, `preminor` and `prepatch` are like `major`, `minor` and `patch` with a prerelease zero suffix, regardless of whether the original version has a prerelease part.

- `2.3.4` + `premajor` => `3.0.0-0`
- `2.3.4-5` + `premajor` => `3.0.0-0`
- `2.3.4` + `preminor` => `2.4.0-0`
- `2.3.4-5` + `preminor` => `2.4.0-0`
- `2.3.4` + `prepatch` => `2.3.5-0`
- `2.3.4-5` + `prepatch` => `2.3.5-0`

### Can I create a Workflow to manually release with any release type I want at the time?

<img width="359" alt="Screenshot 2022-11-14 at 5 35 13 PM" src="https://user-images.githubusercontent.com/112175/201804995-7cb572b4-87a6-4662-9e24-7c4d3b0ff844.png">

Yes! You can provide inputs in the Action web interface before manually triggering a Workflow. [GitHub Action documentation](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#providing-inputs) describes how to do this. Below is an example.

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      release-type:
        description: 'Release Type'
        required: true
        default: 'patch'
        type: choice
        options:
          - major
          - minor
          - patch
          - premajor
          - preminor
          - prepatch
          - prerelease
      prerelease:
        description: 'Prerelease'
        required: true
        default: false
        type: boolean
      dry-run:
        description: 'Dry run'
        required: true
        default: false
        type: boolean

  release:
    name: Release
    concurrency: release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: 'main'

      - uses: CatChen/node-package-release-action@v2
        with:
          release-type: ${{ inputs.release-type || 'patch' }}
          prerelease: ${{ inputs.prerelease || false }}
          dry-run: ${{ inputs.dry-run || false }}
```

### How do I know if `skip-if-no-diff` took effect?

Use an output called `skipped`. See the first code example as a reference.

### What does "last release of the same release type" mean for `skip-if-no-diff`?

Let's say these are the releases returned from `git tag`:

- `v1.0.0`
- `v1.1.0`
- `v1.2.0`
- `v1.2.1`
- `v1.2.2`
- `v1.2.3`
- `v1.2.4-0`
- `v1.2.4-1`

We are going to make a patch release. The release version will be `1.2.4`. `1.2.4`'s last release of the same type (patch) is `1.2.3`.

Before `1.2.3` there is `1.2.2`, but `1.2.2` + `patch` doesn't equal to `1.2.4`. `1.2.2` isn't the last release of the same release type.

After `1.2.3` there is `1.2.4-0` and `1.2.4-0` + `patch` equals to `1.2.4`. However, we should pick `1.2.3`. If there's any diff since `1.2.3` we should make the `1.2.4` release. When we say "release `1.2.4` as a patch if this patch contains any change", we mean changes since `1.2.3`. Even if there's no change since `1.2.4-0` we should still make the release. That's because `1.2.4-0` as a prepatch release may already contains all the changes we want so there's no change since `1.2.4-0`.
