import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Sentimentanalysis from '../lib/sentimentanalysis-stack';

describe('Sentiment Analysis Stack Tests', () => {
    let stack: Sentimentanalysis.SentimentanalysisStack;
    let template: Template;
    let app: cdk.App;

    beforeEach(() => {
        app = new cdk.App();
        stack = new Sentimentanalysis.SentimentanalysisStack(app, 'MyTestStack');
        template = Template.fromStack(stack);
    });
    
    test('Lambda Function created', () => {
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'SentimentAnalyzer'
        });
    });
    
    test('SQS Queue created', () => {
        template.hasResourceProperties('AWS::SQS::Queue', {
            QueueName: 'SentimentAnalyzer-queue'
        });
    });
    
    
    test('Lambda has SQS queue as EventSource', () => {
    template.hasResourceProperties('AWS::Lambda::EventSourceMapping', {
        EventSourceArn: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp('SentimentAnalyzerqueue.*'),
            'Arn'
          ]
        },
        FunctionName: {
          'Ref': Match.stringLikeRegexp('SentimentAnalyzer.*')
        }
      });
    });
    
    test('Lambda Has IAM Policy for Comprehend', () => {
        template.hasResourceProperties('AWS::IAM::Policy', {
            PolicyDocument: {
            Statement: Match.arrayWith([
              Match.objectLike({
                Effect: 'Allow',
                Action: 'comprehend:BatchDetectSentiment',
                Resource: '*'
              })
            ])
          }
        });
    });
});

