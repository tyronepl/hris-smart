export default {
  rootDir: '.',

  moduleFileExtensions: ['js', 'json', 'ts'],

  testRegex: '.*\\.spec\\.ts$',

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ESNext',
          moduleResolution: 'Bundler',
          target: 'ES2023',
          esModuleInterop: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      },
    ],
  },

  extensionsToTreatAsEsm: ['.ts'],

  testEnvironment: 'node',

  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
  ],

  coverageDirectory: './coverage',

  clearMocks: true,
};