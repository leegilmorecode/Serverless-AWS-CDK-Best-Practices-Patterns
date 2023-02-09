import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { EnvironmentConfig } from '../pipeline-types/pipeline-types';
import { StatefulStack } from '../../app/stateful/stateful-stack';
import { StatelessStack } from '../../app/stateless/stateless-stack';

// this is our stage made up of multiple stacks which will be deployed to various environments
// based on config i.e. feature-dev, staging, prod, which also includes our application config
export class PipelineStage extends cdk.Stage {
  public readonly apiEndpointUrl: cdk.CfnOutput;
  public readonly healthCheckUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: EnvironmentConfig) {
    super(scope, id, props);

    const statefulStack = new StatefulStack(this, 'StatefulStack', {
      bucketName: props.stateful.bucketName,
    });
    const statelessStack = new StatelessStack(this, 'StatelessStack', {
      env: {
        account: props.env.account,
        region: props.env.region,
      },
      table: statefulStack.table,
      bucket: statefulStack.bucket,
      lambdaMemorySize: props.stateless.lambdaMemorySize,
      stageName: props.stageName,
    });

    this.apiEndpointUrl = statelessStack.apiEndpointUrl;
    this.healthCheckUrl = statelessStack.healthCheckUrl;
  }
}
