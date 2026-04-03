import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpcStackProps extends cdk.StackProps {
  stage: string;
}

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'AiuiVpc', {
      vpcName: `aiui-vpc-${props.stage}`,
      maxAzs: 2,
      natGateways: props.stage === 'prod' ? 1 : 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType:
            props.stage === 'prod'
              ? ec2.SubnetType.PRIVATE_WITH_EGRESS
              : ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    new cdk.CfnOutput(this, 'VpcId', { value: this.vpc.vpcId });
  }
}
