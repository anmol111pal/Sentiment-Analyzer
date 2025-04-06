import boto3

def handler(event, context):
    for record in event['Records']:
        text = record['body']

        if not text:
            print('No text provided in the msg body')
            continue
        
        print(f'Received text: {text}')
        
        try:
        
            client = boto3.client('comprehend')
            
            response = client.batch_detect_sentiment(
                TextList = [
                    text
                ],
                LanguageCode='en'
            )
            
            if response and 'ResultList' in response and response['ResultList']:
                sentiment = response['ResultList'][0]['Sentiment']
                
                print(f"Sentiment: {sentiment}")
                return sentiment
            else:
                return None
            
        except Exception as e:
            print(f'Error occurred !!', e)

        return "Some error occurred"
