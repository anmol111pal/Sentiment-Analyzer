import { Stack, StackProps } from 'aws-cdk-lib';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class SentimentanalysisStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue: Queue = new Queue(this, 'SentimentAnalyzer-queue', {
      queueName: 'SentimentAnalyzer-queue',
    });

    const handler: Function = new Function(this, 'SentimentAnalyzer', {
      functionName: 'SentimentAnalyzer',
      runtime: Runtime.PYTHON_3_12,
      handler: 'sentimentanalyzer.handler',

      code: Code.fromBucket(
        Bucket.fromBucketName(this, 'LambdaCodeBucket', 'sentiment-analyzer-lambda-code'),
        'sentimentanalyzer-code.zip'
    ),
      memorySize: 512,
    });

    queue.grantConsumeMessages(handler);

    handler.addEventSource(new SqsEventSource(queue));

    handler.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'comprehend:BatchDetectSentiment'
      ],
      resources: ['*']
    }));
  }
}

// Command to zip the code

// Compress-Archive -Path -Update  ".\requirements.txt", ".\sentimentanalyzer.py" -DestinationPath ".\sentimentanalyzer-code.zip"
