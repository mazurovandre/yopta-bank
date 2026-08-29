import type { Config } from 'jest';

const config: Config = {
  projects: [
    '<rootDir>/apps/user-service/jest.config.ts',
    '<rootDir>/apps/notification-service/jest.config.ts',
  ],
  coverageDirectory: 'coverage',
};

export default config;
