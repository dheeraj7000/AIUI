import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface S3StackProps extends cdk.StackProps {
  stage: string;
  /** Allowed CORS origins for all S3 buckets */
  corsOrigins?: string[];
}

export class S3Stack extends cdk.Stack {
  public readonly assetsBucket: s3.Bucket;
  public readonly bundlesBucket: s3.Bucket;
  public readonly previewsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    const { stage } = props;

    const isProd = stage === 'prod';
    const removalPolicy = isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;
    const autoDeleteObjects = !isProd;

    const allowedOrigins = props.corsOrigins ?? ['http://localhost:3000', 'https://*.aiui.dev'];

    const corsRules: s3.CorsRule[] = [
      {
        allowedOrigins,
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.PUT,
          s3.HttpMethods.POST,
          s3.HttpMethods.HEAD,
        ],
        allowedHeaders: ['*'],
        maxAge: 3600,
      },
    ];

    // ── Assets bucket: logos, fonts, icons, illustrations, brand media (permanent) ──
    this.assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: `aiui-assets-${stage}-${cdk.Aws.ACCOUNT_ID}`,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: corsRules,
      removalPolicy,
      autoDeleteObjects,
    });

    // ── Bundles bucket: generated prompt export bundles ──
    this.bundlesBucket = new s3.Bucket(this, 'BundlesBucket', {
      bucketName: `aiui-bundles-${stage}-${cdk.Aws.ACCOUNT_ID}`,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: corsRules,
      removalPolicy,
      autoDeleteObjects,
      lifecycleRules: [
        {
          noncurrentVersionExpiration: cdk.Duration.days(90),
        },
      ],
    });

    // ── Previews bucket: component screenshots (regeneratable) ──
    this.previewsBucket = new s3.Bucket(this, 'PreviewsBucket', {
      bucketName: `aiui-previews-${stage}-${cdk.Aws.ACCOUNT_ID}`,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: corsRules,
      removalPolicy,
      autoDeleteObjects,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(30),
        },
      ],
    });

    // ── CfnOutputs ──
    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: this.assetsBucket.bucketName,
      description: 'Name of the assets S3 bucket',
    });

    new cdk.CfnOutput(this, 'AssetsBucketArn', {
      value: this.assetsBucket.bucketArn,
      description: 'ARN of the assets S3 bucket',
    });

    new cdk.CfnOutput(this, 'BundlesBucketName', {
      value: this.bundlesBucket.bucketName,
      description: 'Name of the bundles S3 bucket',
    });

    new cdk.CfnOutput(this, 'BundlesBucketArn', {
      value: this.bundlesBucket.bucketArn,
      description: 'ARN of the bundles S3 bucket',
    });

    new cdk.CfnOutput(this, 'PreviewsBucketName', {
      value: this.previewsBucket.bucketName,
      description: 'Name of the previews S3 bucket',
    });

    new cdk.CfnOutput(this, 'PreviewsBucketArn', {
      value: this.previewsBucket.bucketArn,
      description: 'ARN of the previews S3 bucket',
    });
  }
}
