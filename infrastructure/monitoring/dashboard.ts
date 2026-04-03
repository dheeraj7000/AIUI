/**
 * CloudWatch Dashboard and Alarm configuration.
 *
 * This module defines the monitoring infrastructure for the AIUI platform.
 * Deploy using AWS CDK or CloudFormation.
 */

export const DASHBOARD_NAME = 'AIUI-Platform';

export interface MetricWidget {
  title: string;
  namespace: string;
  metricName: string;
  stat: 'Average' | 'Sum' | 'Maximum' | 'p50' | 'p95' | 'p99';
  period: number;
}

export const dashboardWidgets: MetricWidget[] = [
  // App Runner
  {
    title: 'API Latency (p50)',
    namespace: 'AWS/AppRunner',
    metricName: 'RequestLatency',
    stat: 'p50',
    period: 300,
  },
  {
    title: 'API Latency (p95)',
    namespace: 'AWS/AppRunner',
    metricName: 'RequestLatency',
    stat: 'p95',
    period: 300,
  },
  {
    title: 'API Latency (p99)',
    namespace: 'AWS/AppRunner',
    metricName: 'RequestLatency',
    stat: 'p99',
    period: 300,
  },
  {
    title: '5xx Error Rate',
    namespace: 'AWS/AppRunner',
    metricName: '5xxStatusResponses',
    stat: 'Sum',
    period: 300,
  },
  {
    title: '2xx Success Rate',
    namespace: 'AWS/AppRunner',
    metricName: '2xxStatusResponses',
    stat: 'Sum',
    period: 300,
  },
  {
    title: 'Active Instances',
    namespace: 'AWS/AppRunner',
    metricName: 'ActiveInstances',
    stat: 'Average',
    period: 300,
  },

  // RDS
  {
    title: 'DB Connections',
    namespace: 'AWS/RDS',
    metricName: 'DatabaseConnections',
    stat: 'Average',
    period: 300,
  },
  {
    title: 'DB CPU',
    namespace: 'AWS/RDS',
    metricName: 'CPUUtilization',
    stat: 'Average',
    period: 300,
  },
  {
    title: 'DB Free Memory',
    namespace: 'AWS/RDS',
    metricName: 'FreeableMemory',
    stat: 'Average',
    period: 300,
  },

  // S3
  {
    title: 'S3 Requests',
    namespace: 'AWS/S3',
    metricName: 'AllRequests',
    stat: 'Sum',
    period: 3600,
  },

  // Cognito
  {
    title: 'Sign-in Attempts',
    namespace: 'AWS/Cognito',
    metricName: 'SignInSuccesses',
    stat: 'Sum',
    period: 3600,
  },
];

export interface AlarmConfig {
  name: string;
  namespace: string;
  metricName: string;
  threshold: number;
  comparisonOperator: 'GreaterThanThreshold' | 'LessThanThreshold';
  evaluationPeriods: number;
  period: number;
  stat: string;
  snsTopicArn: string;
}

export function createAlarmConfig(snsTopicArn: string): AlarmConfig[] {
  return [
    {
      name: 'AIUI-5xx-Rate',
      namespace: 'AWS/AppRunner',
      metricName: '5xxStatusResponses',
      threshold: 10,
      comparisonOperator: 'GreaterThanThreshold',
      evaluationPeriods: 2,
      period: 300,
      stat: 'Sum',
      snsTopicArn,
    },
    {
      name: 'AIUI-API-Latency-High',
      namespace: 'AWS/AppRunner',
      metricName: 'RequestLatency',
      threshold: 5000,
      comparisonOperator: 'GreaterThanThreshold',
      evaluationPeriods: 3,
      period: 300,
      stat: 'p95',
      snsTopicArn,
    },
    {
      name: 'AIUI-DB-Connections-High',
      namespace: 'AWS/RDS',
      metricName: 'DatabaseConnections',
      threshold: 80,
      comparisonOperator: 'GreaterThanThreshold',
      evaluationPeriods: 2,
      period: 300,
      stat: 'Average',
      snsTopicArn,
    },
  ];
}
