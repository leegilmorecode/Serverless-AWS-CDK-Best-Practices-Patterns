import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';

import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface StatefulStackProps extends cdk.StackProps {
  bucketName: string;
}

export class StatefulStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: StatefulStackProps) {
    super(scope, id, props);

    // create the s3 bucket for invoices
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName, // this is passed through per env from config
    });

    // create the dynamodb table
    this.table = new dynamodb.Table(this, 'Table', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: false,
      contributorInsightsEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}
