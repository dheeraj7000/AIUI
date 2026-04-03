import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
  stage: string;
  webServiceName: string;
  mcpServiceName: string;
  rdsInstanceId: string;
}

export class MonitoringStack extends cdk.Stack {
  public readonly alarmTopic: sns.Topic;
  public readonly dashboardName: string;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const { stage, webServiceName, mcpServiceName } = props;

    const isProd = stage === 'prod';
    const removalPolicy = isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;

    // ── SNS Alarm Topic ──
    this.alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName: `aiui-alarms-${stage}`,
      displayName: `AIUI ${stage} Alarms`,
    });

    // Email subscription — replace with actual email or parameterize
    const alarmEmail = new cdk.CfnParameter(this, 'AlarmEmail', {
      type: 'String',
      default: 'ops@example.com',
      description: 'Email address for CloudWatch alarm notifications',
    });

    this.alarmTopic.addSubscription(
      new sns_subscriptions.EmailSubscription(alarmEmail.valueAsString)
    );

    // ── CloudWatch Log Groups ──
    new logs.LogGroup(this, 'WebAppRunnerLogs', {
      logGroupName: `/aws/apprunner/aiui-web-${stage}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy,
    });

    new logs.LogGroup(this, 'McpAppRunnerLogs', {
      logGroupName: `/aws/apprunner/aiui-mcp-${stage}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy,
    });

    new logs.LogGroup(this, 'PostConfirmationLambdaLogs', {
      logGroupName: `/aws/lambda/aiui-post-confirmation-${stage}`,
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy,
    });

    // ── Helper: App Runner metric ──
    const appRunnerMetric = (
      serviceName: string,
      metricName: string,
      statistic: string
    ): cloudwatch.Metric =>
      new cloudwatch.Metric({
        namespace: 'AWS/AppRunner',
        metricName,
        statistic,
        dimensionsMap: { ServiceName: serviceName },
        period: cdk.Duration.minutes(5),
      });

    // ── CloudWatch Alarms ──

    // Web 5xx errors: > 5 over 5 min, 1 evaluation period
    const web5xxAlarm = new cloudwatch.Alarm(this, 'Web5xxAlarm', {
      alarmName: `aiui-web-5xx-${stage}`,
      alarmDescription: 'Web App Runner service 5xx error count exceeded threshold',
      metric: appRunnerMetric(webServiceName, '5xxCount', 'Sum'),
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    web5xxAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

    // MCP 5xx errors: > 5 over 5 min, 1 evaluation period
    const mcp5xxAlarm = new cloudwatch.Alarm(this, 'Mcp5xxAlarm', {
      alarmName: `aiui-mcp-5xx-${stage}`,
      alarmDescription: 'MCP App Runner service 5xx error count exceeded threshold',
      metric: appRunnerMetric(mcpServiceName, '5xxCount', 'Sum'),
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    mcp5xxAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

    // Web latency: p95 > 3000ms over 5 min, 2 evaluation periods
    const webLatencyAlarm = new cloudwatch.Alarm(this, 'WebLatencyAlarm', {
      alarmName: `aiui-web-latency-p95-${stage}`,
      alarmDescription: 'Web App Runner service p95 latency exceeded 3000ms',
      metric: appRunnerMetric(webServiceName, 'RequestLatency', 'p95'),
      threshold: 3000,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    webLatencyAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

    // MCP latency: p95 > 5000ms over 5 min, 2 evaluation periods
    const mcpLatencyAlarm = new cloudwatch.Alarm(this, 'McpLatencyAlarm', {
      alarmName: `aiui-mcp-latency-p95-${stage}`,
      alarmDescription: 'MCP App Runner service p95 latency exceeded 5000ms',
      metric: appRunnerMetric(mcpServiceName, 'RequestLatency', 'p95'),
      threshold: 5000,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    mcpLatencyAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));

    // ── CloudWatch Dashboard ──
    this.dashboardName = `aiui-${stage}`;

    const dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: this.dashboardName,
    });

    // Widget 1: Request latency (p50, p95, p99) for both services — line graph
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'App Runner Request Latency',
        width: 24,
        height: 8,
        left: [
          appRunnerMetric(webServiceName, 'RequestLatency', 'p50').with({ label: 'Web p50' }),
          appRunnerMetric(webServiceName, 'RequestLatency', 'p95').with({ label: 'Web p95' }),
          appRunnerMetric(webServiceName, 'RequestLatency', 'p99').with({ label: 'Web p99' }),
          appRunnerMetric(mcpServiceName, 'RequestLatency', 'p50').with({ label: 'MCP p50' }),
          appRunnerMetric(mcpServiceName, 'RequestLatency', 'p95').with({ label: 'MCP p95' }),
          appRunnerMetric(mcpServiceName, 'RequestLatency', 'p99').with({ label: 'MCP p99' }),
        ],
      })
    );

    // Widget 2: 5xx errors for both services — line graph
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'App Runner 5xx Errors',
        width: 24,
        height: 6,
        left: [
          appRunnerMetric(webServiceName, '5xxCount', 'Sum').with({ label: 'Web 5xx' }),
          appRunnerMetric(mcpServiceName, '5xxCount', 'Sum').with({ label: 'MCP 5xx' }),
        ],
      })
    );

    // Widget 3: Active instances — number widget
    dashboard.addWidgets(
      new cloudwatch.SingleValueWidget({
        title: 'App Runner Active Instances',
        width: 24,
        height: 4,
        metrics: [
          appRunnerMetric(webServiceName, 'ActiveInstances', 'Average').with({
            label: 'Web Instances',
          }),
          appRunnerMetric(mcpServiceName, 'ActiveInstances', 'Average').with({
            label: 'MCP Instances',
          }),
        ],
      })
    );

    // ── Exports ──
    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: this.alarmTopic.topicArn,
      description: 'ARN of the SNS topic for CloudWatch alarms',
      exportName: `aiui-alarm-topic-arn-${stage}`,
    });

    new cdk.CfnOutput(this, 'DashboardName', {
      value: this.dashboardName,
      description: 'Name of the CloudWatch dashboard',
      exportName: `aiui-dashboard-name-${stage}`,
    });
  }
}
