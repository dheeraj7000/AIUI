import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface CognitoStackProps extends cdk.StackProps {
  stage: string;
  rdsSecretArn: string;
}

export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly postConfirmationLambda: lambda.Function;

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    const { stage, rdsSecretArn } = props;

    // Post-confirmation Lambda trigger
    this.postConfirmationLambda = new lambda.Function(this, 'PostConfirmationFn', {
      functionName: `aiui-post-confirmation-${stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          const { sub, email } = event.request.userAttributes;
          console.log(\`Post-confirmation: user \${email} (sub: \${sub})\`);
          // TODO: Insert user record into RDS database
          return event;
        };
      `),
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        STAGE: stage,
        RDS_SECRET_ARN: rdsSecretArn,
      },
    });

    // User Pool
    this.userPool = new cognito.UserPool(this, 'AiuiUserPool', {
      userPoolName: `aiui-users-${stage}`,
      signInAliases: {
        email: true,
      },
      selfSignUpEnabled: true,
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      customAttributes: {
        orgId: new cognito.StringAttribute({ mutable: true }),
        role: new cognito.StringAttribute({ mutable: true }),
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: false,
        otp: true,
      },
      deletionProtection: stage === 'prod',
      removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      lambdaTriggers: {
        postConfirmation: this.postConfirmationLambda,
      },
    });

    // App Client
    this.userPoolClient = this.userPool.addClient('AiuiWebClient', {
      userPoolClientName: `aiui-web-${stage}`,
      authFlows: {
        userSrp: true,
        userPassword: true,
      },
      generateSecret: false,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: [
          'http://localhost:3000/api/auth/callback',
          'https://app.aiui.dev/api/auth/callback',
        ],
        logoutUrls: ['http://localhost:3000', 'https://app.aiui.dev'],
      },
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
      preventUserExistenceErrors: true,
    });

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolArn', {
      value: this.userPool.userPoolArn,
      description: 'Cognito User Pool ARN',
    });

    new cdk.CfnOutput(this, 'AppClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito App Client ID',
    });

    new cdk.CfnOutput(this, 'PostConfirmationLambdaArn', {
      value: this.postConfirmationLambda.functionArn,
      description: 'Post-confirmation Lambda function ARN',
    });
  }
}
