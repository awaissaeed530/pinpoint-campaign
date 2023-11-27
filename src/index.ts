import { DynamoDBClient, ScanCommand, ScanCommandInput } from "@aws-sdk/client-dynamodb";
import { PinpointEmailClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-pinpoint-email";
import { config } from "dotenv";

config();

const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) throw new Error("Please provide AWS credentials")

const emailOptions = {
    from: "admin@awaissaeed.com",
    subject: "Testing 1,2,3...",
    content: "This is a test mail sent from Amazon Pinpoint"
}

const pinPointClient = new PinpointEmailClient({
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    } 
});
const dynamoClient = new DynamoDBClient({
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    } 
});

(async () => {
    try {
        const contacts = await getContacts();
        const emails = contacts.Items?.map((item) => item.email?.S).filter((email) => !!email);
        console.log("Emails: ", emails);
        const res = await sendEmail(emails as string[]);
        console.log("Message: ", res.MessageId);
    } catch (e) {
        console.log(e);
    }
})();

async function sendEmail(emails: string[]) {
    const input: SendEmailCommandInput = {
        FromEmailAddress: emailOptions.from,
        Destination: {
            ToAddresses: emails,
        },
        ReplyToAddresses: [emailOptions.from],
        FeedbackForwardingEmailAddress: emailOptions.from,
        Content: {
            Simple: {
                Subject: {
                    Data: emailOptions.subject,
                    Charset: "UTF-8",
                },
                Body: {
                    Text: {
                        Data: emailOptions.content,
                        Charset: "UTF-8",
                    },
                },
            },
        },
    };
    const command = new SendEmailCommand(input);
    return pinPointClient.send(command);
}

async function getContacts() {
    const input: ScanCommandInput = {
        TableName: "upwork-test-pinpoint-campaign"
    };
    const command = new ScanCommand(input);
    return dynamoClient.send(command);
}
