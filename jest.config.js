module.exports = {
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "html", "text"],
  setupFiles: ["./.jestEnv"],
}
//preset: "@shelf/jest-dynamodb",
