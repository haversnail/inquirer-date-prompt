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
  ],
};
