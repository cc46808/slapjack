export default {
    testEnvironment: 'node',
    transform: {
      '^.+\\.js$': 'babel-jest'
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    collectCoverage: true,
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/server.js'
    ]
  };