#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { RdsStack } from '../lib/rds-stack';
import { S3Stack } from '../lib/s3-stack';
import { CognitoStack } from '../lib/cognito-stack';
import { AppRunnerStack } from '../lib/app-runner-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';
import { MonitoringStack } from '../lib/monitoring-stack';

const app = new cdk.App();

const stage = app.node.tryGetContext('stage') || 'dev';

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// VPC Stack
const vpcStack = new VpcStack(app, `AiuiVpc-${stage}`, {
  stage,
  env,
});

// RDS PostgreSQL Stack
const rdsStack = new RdsStack(app, `AiuiRds-${stage}`, {
  vpc: vpcStack.vpc,
  stage,
  env,
});
rdsStack.addDependency(vpcStack);

// S3 Storage Stack
const s3Stack = new S3Stack(app, `AiuiS3-${stage}`, {
  stage,
  env,
});

// Cognito Authentication Stack
const cognitoStack = new CognitoStack(app, `AiuiCognito-${stage}`, {
  stage,
  rdsSecretArn: rdsStack.dbSecret.secretArn,
  env,
});
cognitoStack.addDependency(rdsStack);

// App Runner Stack (web app + MCP server)
const appRunnerStack = new AppRunnerStack(app, `AiuiAppRunner-${stage}`, {
  stage,
  vpc: vpcStack.vpc,
  rdsSecurityGroupId: rdsStack.dbSecurityGroup.securityGroupId,
  rdsSecretArn: rdsStack.dbSecret.secretArn,
  s3BucketNames: {
    assets: s3Stack.assetsBucket.bucketName,
    bundles: s3Stack.bundlesBucket.bucketName,
    previews: s3Stack.previewsBucket.bucketName,
  },
  cognitoUserPoolId: cognitoStack.userPool.userPoolId,
  cognitoClientId: cognitoStack.userPoolClient.userPoolClientId,
  env,
});
appRunnerStack.addDependency(vpcStack);
appRunnerStack.addDependency(rdsStack);
appRunnerStack.addDependency(s3Stack);
appRunnerStack.addDependency(cognitoStack);

// CloudFront CDN Stack (uses bucket names to avoid cross-stack dependency cycle)
new CloudFrontStack(app, `AiuiCloudFront-${stage}`, {
  stage,
  assetsBucketName: s3Stack.assetsBucket.bucketName,
  bundlesBucketName: s3Stack.bundlesBucket.bucketName,
  previewsBucketName: s3Stack.previewsBucket.bucketName,
  env,
});

// Monitoring Stack (CloudWatch alarms, dashboards, log groups)
const monitoringStack = new MonitoringStack(app, `AiuiMonitoring-${stage}`, {
  stage,
  webServiceName: `aiui-web-${stage}`,
  mcpServiceName: `aiui-mcp-${stage}`,
  rdsInstanceId: `aiui-db-${stage}`,
  env,
});
monitoringStack.addDependency(appRunnerStack);

app.synth();
