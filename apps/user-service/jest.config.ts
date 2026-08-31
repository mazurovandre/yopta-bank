import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const rootTsconfig = require('../../tsconfig.json');
const appTsconfig = require('./tsconfig.app.json');

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.app.json' }],
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(
    {
      ...rootTsconfig.compilerOptions.paths,
      ...appTsconfig.compilerOptions.paths,
    },
    { prefix: '<rootDir>/../../' },
  ),
};

export default config;
