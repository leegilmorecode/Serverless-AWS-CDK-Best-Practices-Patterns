export interface EnvironmentConfig {
  env: {
    account: string;
    region: string;
  };
  stageName: string;
  stateful: {
    bucketName: string;
  };
  stateless: {
    lambdaMemorySize: number;
  };
}

export const enum Region {
  dublin = 'eu-west-1',
  london = 'eu-west-2',
  frankfurt = 'eu-central-1',
}

export const enum Stage {
  featureDev = 'featureDev',
  staging = 'staging',
  prod = 'prod',
  develop = 'develop',
}

export const enum Account {
  featureDev = '11111111111',
  staging = '22222222222',
  prod = '33333333333',
}
