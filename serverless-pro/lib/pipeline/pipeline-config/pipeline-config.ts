import * as dotenv from 'dotenv';

import {
  Account,
  EnvironmentConfig,
  Region,
  Stage,
} from '../pipeline-types/pipeline-types';

dotenv.config();

export const environments: Record<Stage, EnvironmentConfig> = {
  // allow developers to spin up a quick branch for a given PR they are working on e.g. pr-124
  // this is done with an npm run develop, not through the pipeline, and uses the values in .env
  [Stage.develop]: {
    env: {
      account:
        process.env.ACCOUNT || (process.env.CDK_DEFAULT_ACCOUNT as string),
      region: process.env.REGION || (process.env.CDK_DEFAULT_REGION as string),
    },
    stateful: {
      bucketName:
        `serverless-pro-${process.env.PR_NUMBER}-bucket`.toLowerCase(),
    },
    stateless: {
      lambdaMemorySize: parseInt(process.env.LAMBDA_MEM_SIZE || '128'),
    },
    stageName: process.env.PR_NUMBER || Stage.develop,
  },
  [Stage.featureDev]: {
    env: {
      account: Account.featureDev,
      region: Region.dublin,
    },
    stateful: {
      bucketName: 'serverless-pro-feature-dev-bucket',
    },
    stateless: {
      lambdaMemorySize: 128,
    },
    stageName: Stage.featureDev,
  },
  [Stage.staging]: {
    env: {
      account: Account.staging,
      region: Region.dublin,
    },
    stateful: {
      bucketName: 'serverless-pro-staging-bucket',
    },
    stateless: {
      lambdaMemorySize: 512,
    },
    stageName: Stage.staging,
  },
  [Stage.prod]: {
    env: {
      account: Account.prod,
      region: Region.dublin,
    },
    stateful: {
      bucketName: 'serverless-pro-prod-bucket',
    },
    stateless: {
      lambdaMemorySize: 1024,
    },
    stageName: Stage.prod,
  },
};
