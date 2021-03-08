module.exports = {
  plugins: [
    // prettier-ignore
    ["@semantic-release/commit-analyzer", {
      preset: "angular",
    }],
    // prettier-ignore
    ["@semantic-release/release-notes-generator", {
      preset: "angular",
    }],
    "@semantic-release/github",
    "@semantic-release/npm",
    // prettier-ignore
    ["@semantic-release/git", {
      assets: ["package.json", "package-lock.json"],
      message: "build(Release): bump version to ${nextRelease.version}",
    }],
  ],
};
