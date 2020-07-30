module.exports = {
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['dist', 'build'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.ts'],
  reporters: ['default'],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'cobertura']
};
