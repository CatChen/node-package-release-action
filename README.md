# node-package-release-action

[![Build](https://github.com/CatChen/node-package-release-action/actions/workflows/build.yml/badge.svg)](https://github.com/CatChen/node-package-release-action/actions/workflows/build.yml)
[![Test](https://github.com/CatChen/node-package-release-action/actions/workflows/test.yml/badge.svg)](https://github.com/CatChen/node-package-release-action/actions/workflows/test.yml)
[![ESLint](https://github.com/CatChen/node-package-release-action/actions/workflows/eslint.yml/badge.svg)](https://github.com/CatChen/node-package-release-action/actions/workflows/eslint.yml)
[![CodeQL](https://github.com/CatChen/node-package-release-action/actions/workflows/codeql.yml/badge.svg)](https://github.com/CatChen/node-package-release-action/actions/workflows/codeql.yml)
[![Ship](https://github.com/CatChen/node-package-release-action/actions/workflows/ship.yml/badge.svg)](https://github.com/CatChen/node-package-release-action/actions/workflows/ship.yml)

Stop running `npm version patch` manually to release a new version of your NPM package. Let this Action automate for you. Trigger it on GitHub or schedule a weekly or monthly release.

## Examples

```yaml
name: Release

on:
  schedule:
    - cron: "0 12 * * 0" # every sunday noon
  workflow_dispatch:

jobs:
  accept_to_ship:
    name: Accept to Ship
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: CatChen/node-package-release-action@v0.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }} # optional
          release-type: prerelease # optional
          prerelease: true # optional
          dry-run: false # optional
```

## Options

### `github-token`

The default value is `${{ github.token }}`, which is the GitHub token generated for this workflow. You can [create a different token with a different set of permissions](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) and use it here as well.

### `release-type`

Which part of the [semver](https://semver.org/) should be increased for the next release. Valid inputs are `major`, `premajor`, `minor`, `preminor`, `patch`, `prepatch` and `prerelease`. The list of valid inputs is from [`semver.inc`](https://github.com/npm/node-semver#functions), which is used by the `npm version` command. The default value is `prerelease`. This is independent from the `prerelease` input.

### `prerelease`

This controls whether the GitHub Release should be marked as a prerelease. The default value is `true`. This is independent from the `release-type` input.

### `dry-run`

This controls whether this is a dry run. The default value is `false`. It's used for debugging only.

## FAQ

### How do all the `release-type` options work?

Let's start with the easy ones. `major`, `minor` and `patch` increase their corresponding part and reset the parts behind them to zero.

- `2.3.4` + `major` => `3.0.0`
- `2.3.4` + `minor` => `2.4.0`
- `2.3.4` + `patch` => `2.3.5`

`prerelease` is an interesting one. It increases the prerelease part if it exists. Otherwise, it increases the minor part and append a prerelease zero suffix.

- `2.3.4-0` + `prerelease` => `2.3.4-1`
- `2.3.4` + `prerelease` => `2.3.5-0`

`premajor`, `preminor` and `prepatch` are like `major`, `minor` and `patch` with a prerelease zero suffix, regardless of whether the original version has a prerelease part.

- `2.3.4` + `premajor` => `3.0.0-0`
- `2.3.4-5` + `premajor` => `3.0.0-0`
- `2.3.4` + `preminor` => `2.4.0-0`
- `2.3.4-5` + `preminor` => `2.4.0-0`
- `2.3.4` + `prepatch` => `2.3.5-0`
- `2.3.4-5` + `prepatch` => `2.3.5-0`
