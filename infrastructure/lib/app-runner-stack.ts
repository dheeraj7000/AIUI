import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import { Construct } from 'constructs';

export interface AppRunnerStackProps extends cdk.StackProps {
  stage: string;
  vpc: ec2.IVpc;
  rdsSecurityGroupId: string;
  rdsSecretArn: string;
  s3BucketNames: {
    assets: string;
    bundles: string;
    previews: string;
  };
  cognitoUserPoolId: string;
  cognitoClientId: string;
}

export class AppRunnerStack extends cdk.Stack {
  public readonly webServiceUrl: string;
  public readonly mcpServiceUrl: string;
  public readonly webServiceArn: string;
  public readonly mcpServiceArn: string;

  constructor(scope: Construct, id: string, props: AppRunnerStackProps) {
    super(scope, id, props);

    const {
      stage,
      vpc,
      rdsSecurityGroupId,
      rdsSecretArn,
      s3BucketNames,
      cognitoUserPoolId,
      cognitoClientId,
    } = props;

    // ── Security Group for VPC Connector ──
    // Allows outbound traffic to RDS on port 5432
    const vpcConnectorSg = new ec2.SecurityGroup(this, 'AppRunnerVpcConnectorSg', {
      vpc,
      securityGroupName: `aiui-apprunner-vpc-sg-${stage}`,
      description: 'Security group for App Runner VPC connector - allows outbound to RDS',
      allowAllOutbound: false,
    });

    vpcConnectorSg.addEgressRule(
      ec2.Peer.securityGroupId(rdsSecurityGroupId),
      ec2.Port.tcp(5432),
      'Allow outbound to RDS PostgreSQL'
    );

    // Allow general HTTPS outbound for Secrets Manager, S3, etc.
    vpcConnectorSg.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow outbound HTTPS for AWS services'
    );

    // ── VPC Connector ──
    const privateSubnets = vpc.selectSubnets({
      subnetType:
        stage === 'prod' ? ec2.SubnetType.PRIVATE_WITH_EGRESS : ec2.SubnetType.PRIVATE_ISOLATED,
    });

    const vpcConnector = new apprunner.CfnVpcConnector(this, 'VpcConnector', {
      vpcConnectorName: `aiui-vpc-connector-${stage}`,
      subnets: privateSubnets.subnetIds,
      securityGroups: [vpcConnectorSg.securityGroupId],
    });

    // ── IAM Instance Role for App Runner ──
    const instanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      roleName: `aiui-apprunner-instance-${stage}`,
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
      description: 'IAM role assumed by App Runner service instances',
    });

    // Secrets Manager read access
    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'SecretsManagerRead',
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue', 'secretsmanager:DescribeSecret'],
        resources: [rdsSecretArn],
      })
    );

    // S3 read/write access to all three buckets
    const s3BucketArns = [
      `arn:aws:s3:::${s3BucketNames.assets}`,
      `arn:aws:s3:::${s3BucketNames.bundles}`,
      `arn:aws:s3:::${s3BucketNames.previews}`,
    ];

    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'S3ReadWrite',
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket'],
        resources: [...s3BucketArns, ...s3BucketArns.map((arn) => `${arn}/*`)],
      })
    );

    // CloudWatch Logs
    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        sid: 'CloudWatchLogs',
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
          'logs:DescribeLogStreams',
        ],
        resources: [
          `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/apprunner/aiui-*`,
          `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/apprunner/aiui-*:*`,
        ],
      })
    );

    // ── IAM Access Role for ECR (used by App Runner to pull images) ──
    const accessRole = new iam.Role(this, 'AppRunnerAccessRole', {
      roleName: `aiui-apprunner-access-${stage}`,
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
      description: 'IAM role for App Runner to pull images from ECR',
    });

    accessRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSAppRunnerServicePolicyForECRAccess'
      )
    );

    // ── Shared environment variables ──
    const sharedEnvVars: apprunner.CfnService.KeyValuePairProperty[] = [
      { name: 'NODE_ENV', value: stage === 'prod' ? 'production' : 'development' },
      { name: 'RDS_SECRET_ARN', value: rdsSecretArn },
      { name: 'NEXT_PUBLIC_COGNITO_POOL_ID', value: cognitoUserPoolId },
      { name: 'NEXT_PUBLIC_COGNITO_CLIENT_ID', value: cognitoClientId },
      { name: 'S3_ASSETS_BUCKET', value: s3BucketNames.assets },
      { name: 'S3_BUNDLES_BUCKET', value: s3BucketNames.bundles },
      { name: 'S3_PREVIEWS_BUCKET', value: s3BucketNames.previews },
      { name: 'STAGE', value: stage },
    ];

    // ── Web App Service ──
    const webService = new apprunner.CfnService(this, 'WebAppService', {
      serviceName: `aiui-web-${stage}`,
      sourceConfiguration: {
        // ECR image will be configured by CI/CD pipeline.
        // Using a placeholder image configuration — replace with actual ECR repo URI.
        imageRepository: {
          imageIdentifier: 'public.ecr.aws/nginx/nginx:latest',
          imageRepositoryType: 'ECR_PUBLIC',
          imageConfiguration: {
            port: '3000',
            runtimeEnvironmentVariables: sharedEnvVars,
          },
        },
        autoDeploymentsEnabled: false,
      },
      instanceConfiguration: {
        cpu: '1024', // 1 vCPU
        memory: '2048', // 2 GB
        instanceRoleArn: instanceRole.roleArn,
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: '/api/health',
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
      autoScalingConfigurationArn: new apprunner.CfnAutoScalingConfiguration(
        this,
        'WebAutoScaling',
        {
          autoScalingConfigurationName: `aiui-web-scaling-${stage}`,
          minSize: 1,
          maxSize: 4,
          maxConcurrency: 100,
        }
      ).attrAutoScalingConfigurationArn,
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'VPC',
          vpcConnectorArn: vpcConnector.attrVpcConnectorArn,
        },
      },
    });

    // ── MCP Server Service ──
    const mcpEnvVars: apprunner.CfnService.KeyValuePairProperty[] = [
      ...sharedEnvVars,
      { name: 'MCP_SERVER_PORT', value: '8080' },
    ];

    const mcpService = new apprunner.CfnService(this, 'McpServerService', {
      serviceName: `aiui-mcp-${stage}`,
      sourceConfiguration: {
        // ECR image will be configured by CI/CD pipeline.
        // Using a placeholder image configuration — replace with actual ECR repo URI.
        imageRepository: {
          imageIdentifier: 'public.ecr.aws/nginx/nginx:latest',
          imageRepositoryType: 'ECR_PUBLIC',
          imageConfiguration: {
            port: '8080',
            runtimeEnvironmentVariables: mcpEnvVars,
          },
        },
        autoDeploymentsEnabled: false,
      },
      instanceConfiguration: {
        cpu: '512', // 0.5 vCPU
        memory: '1024', // 1 GB
        instanceRoleArn: instanceRole.roleArn,
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: '/health',
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
      autoScalingConfigurationArn: new apprunner.CfnAutoScalingConfiguration(
        this,
        'McpAutoScaling',
        {
          autoScalingConfigurationName: `aiui-mcp-scaling-${stage}`,
          minSize: 1,
          maxSize: 2,
          maxConcurrency: 100,
        }
      ).attrAutoScalingConfigurationArn,
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'VPC',
          vpcConnectorArn: vpcConnector.attrVpcConnectorArn,
        },
      },
    });

    // ── Store public properties ──
    this.webServiceUrl = webService.attrServiceUrl;
    this.mcpServiceUrl = mcpService.attrServiceUrl;
    this.webServiceArn = webService.attrServiceArn;
    this.mcpServiceArn = mcpService.attrServiceArn;

    // ── CfnOutputs ──
    new cdk.CfnOutput(this, 'WebServiceUrl', {
      value: `https://${webService.attrServiceUrl}`,
      description: 'URL of the AIUI web application App Runner service',
    });

    new cdk.CfnOutput(this, 'WebServiceArn', {
      value: webService.attrServiceArn,
      description: 'ARN of the web App Runner service',
    });

    new cdk.CfnOutput(this, 'McpServiceUrl', {
      value: `https://${mcpService.attrServiceUrl}`,
      description: 'URL of the MCP server App Runner service',
    });

    new cdk.CfnOutput(this, 'McpServiceArn', {
      value: mcpService.attrServiceArn,
      description: 'ARN of the MCP server App Runner service',
    });
  }
}
