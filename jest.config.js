module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.ts'],
  reporters: ['default'],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'cobertura']
};
