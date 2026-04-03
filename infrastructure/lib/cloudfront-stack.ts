import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface CloudFrontStackProps extends cdk.StackProps {
  stage: string;
  assetsBucketName: string;
  bundlesBucketName: string;
  previewsBucketName: string;
}

export class CloudFrontStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    const { stage, assetsBucketName, bundlesBucketName, previewsBucketName } = props;

    // Import buckets by name to avoid cross-stack dependency cycles
    const assetsBucket = s3.Bucket.fromBucketName(this, 'AssetsBucket', assetsBucketName);
    const bundlesBucket = s3.Bucket.fromBucketName(this, 'BundlesBucket', bundlesBucketName);
    const previewsBucket = s3.Bucket.fromBucketName(this, 'PreviewsBucket', previewsBucketName);

    // ── Cache Policies ──

    // Assets: long-lived immutable content (logos, fonts, icons)
    const assetsCachePolicy = new cloudfront.CachePolicy(this, 'AssetsCachePolicy', {
      cachePolicyName: `aiui-assets-cache-${stage}`,
      comment: 'Long TTL for immutable assets (fonts, logos, icons)',
      defaultTtl: cdk.Duration.days(365),
      minTtl: cdk.Duration.days(1),
      maxTtl: cdk.Duration.days(365),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Bundles: short-lived generated content that changes frequently
    const bundlesCachePolicy = new cloudfront.CachePolicy(this, 'BundlesCachePolicy', {
      cachePolicyName: `aiui-bundles-cache-${stage}`,
      comment: 'Short TTL for generated bundles with must-revalidate',
      defaultTtl: cdk.Duration.minutes(5),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.minutes(30),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Previews: medium-lived regeneratable content
    const previewsCachePolicy = new cloudfront.CachePolicy(this, 'PreviewsCachePolicy', {
      cachePolicyName: `aiui-previews-cache-${stage}`,
      comment: 'Medium TTL for preview screenshots',
      defaultTtl: cdk.Duration.days(1),
      minTtl: cdk.Duration.minutes(5),
      maxTtl: cdk.Duration.days(7),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // ── S3 Origins with OAC (automatically creates OAC + bucket policies) ──

    const assetsOrigin = origins.S3BucketOrigin.withOriginAccessControl(assetsBucket);
    const bundlesOrigin = origins.S3BucketOrigin.withOriginAccessControl(bundlesBucket);
    const previewsOrigin = origins.S3BucketOrigin.withOriginAccessControl(previewsBucket);

    // ── CloudFront Distribution ──

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `AIUI CDN Distribution (${stage})`,

      // Default behavior: assets bucket (serves as the primary origin)
      defaultBehavior: {
        origin: assetsOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: assetsCachePolicy,
        compress: true,
      },

      // Path-based additional behaviors
      additionalBehaviors: {
        '/assets/*': {
          origin: assetsOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          cachePolicy: assetsCachePolicy,
          compress: true,
        },
        '/bundles/*': {
          origin: bundlesOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: bundlesCachePolicy,
          compress: true,
        },
        '/previews/*': {
          origin: previewsOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: previewsCachePolicy,
          compress: true,
        },
      },

      // Distribution settings
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      enabled: true,

      // Custom error responses: 403 -> 404
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    // ── CfnOutputs ──

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront distribution ID',
    });
  }
}
