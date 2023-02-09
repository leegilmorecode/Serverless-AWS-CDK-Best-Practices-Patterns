import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';

import { Construct } from 'constructs';

export interface StatelessStackProps extends cdk.StackProps {
  env: {
    account: string;
    region: string;
  };
  table: dynamodb.Table;
  bucket: s3.Bucket;
  stageName: string;
  lambdaMemorySize: number;
}

export class StatelessStack extends cdk.Stack {
  public readonly apiEndpointUrl: cdk.CfnOutput;
  public readonly healthCheckUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props);

    const { table, bucket } = props;

    // create the rest api
    const ordersApi: apigw.RestApi = new apigw.RestApi(this, 'Api', {
      description: `Serverless Pro API ${props.stageName}`,
      deploy: true,
      endpointTypes: [apigw.EndpointType.REGIONAL],
      cloudWatchRole: true,
      deployOptions: {
        stageName: props.stageName,
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
    });

    // create the rest api resources
    const orders: apigw.Resource = ordersApi.root.addResource('orders');
    const healthCheck: apigw.Resource =
      ordersApi.root.addResource('health-checks');

    const order: apigw.Resource = orders.addResource('{id}');

    // create the lambdas
    const createOrderLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'CreateOrderLambda', {
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: path.join(
          __dirname,
          'src/handlers/create-order/create-order.ts'
        ),
        memorySize: props.lambdaMemorySize, // this is passed through per env from config
        handler: 'handler',
        bundling: {
          minify: true,
          externalModules: ['aws-sdk'],
        },
        environment: {
          TABLE_NAME: table.tableName,
          BUCKET_NAME: bucket.bucketName,
        },
      });

    const getOrderLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'GetOrderLambda', {
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: path.join(__dirname, 'src/handlers/get-order/get-order.ts'),
        memorySize: props.lambdaMemorySize, // this is passed through per env from config
        handler: 'handler',
        bundling: {
          minify: true,
          externalModules: ['aws-sdk'],
        },
        environment: {
          TABLE_NAME: table.tableName,
          BUCKET_NAME: bucket.bucketName,
        },
      });

    const healthCheckLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'HealthCheckLambda', {
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: path.join(
          __dirname,
          'src/handlers/health-check/health-check.ts'
        ),
        memorySize: props.lambdaMemorySize, // this is passed through per env from config
        handler: 'handler',
        bundling: {
          minify: true,
          externalModules: ['aws-sdk'],
        },
      });

    // hook up the lambda functions to the api
    orders.addMethod(
      'POST',
      new apigw.LambdaIntegration(createOrderLambda, {
        proxy: true,
      })
    );

    order.addMethod(
      'GET',
      new apigw.LambdaIntegration(getOrderLambda, {
        proxy: true,
      })
    );

    healthCheck.addMethod(
      'GET',
      new apigw.LambdaIntegration(healthCheckLambda, {
        proxy: true,
      })
    );

    // grant the relevant lambdas access to our dynamodb database
    table.grantReadData(getOrderLambda);
    table.grantWriteData(createOrderLambda);

    // grant the create order lambda access to the s3 bucket
    bucket.grantWrite(createOrderLambda);

    this.apiEndpointUrl = new cdk.CfnOutput(this, 'ApiEndpointOutput', {
      value: ordersApi.url,
      exportName: `api-endpoint-${props.stageName}`,
    });

    this.healthCheckUrl = new cdk.CfnOutput(this, 'healthCheckUrlOutput', {
      value: `${ordersApi.url}health-checks`,
      exportName: `healthcheck-endpoint-${props.stageName}`,
    });
  }
}
