# add-pr-comment

> A GitHub Action which adds a comment to a Pull Request Issue.

## Usage

```yaml
on:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      uses: mshick/add-pr-comment@v1
      with:
        message: |
          **Hello**
          🌏
          !
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        allow-repeats: false # This is the default
```

You can even use it on PR Issues that are related to PRs that were merged into master, for example:

```yaml
on:
  push:
    branches:
      - master

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      uses: mshick/add-pr-comment@v1
      with:
        message: |
          **Hello MASTER**
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        allow-repeats: true
```

## Features

- Fast, runs in the GitHub Actions node.js runtime; no Docker pull needed.
- Modify issues for PRs merged to master.
- Multiple posts of the same comment optionally allowable.
- Supports emoji 😂😂😂!

## Use Case

- Adding a deployed app URL to a PR issue
- Printing some sort of output to the PR issue for human-readability
