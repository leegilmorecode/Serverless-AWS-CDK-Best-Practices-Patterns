#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { PipelineStack } from '../lib/pipeline/pipeline-stack/pipeline-stack';
import { environments } from '../lib/pipeline/pipeline-config/pipeline-config';

const app = new cdk.App();

// this is the main pipeline entry point
// including the environment where the pipeline itself will be created
// note: we will use featureDev for now - but there would be a dedicated pipeline account
new PipelineStack(app, 'ServerlessPro', {
  env: {
    region: environments.featureDev.env.region,
    account: environments.featureDev.env.account,
  },
});

app.synth();
