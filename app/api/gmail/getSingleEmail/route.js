import { google } from 'googleapis';

export async function GET(req) {
    try {
        const urlObject = new URL(req.url)
        const id = urlObject.searchParams.get('id');
        let messageIdToFetch = '';

        if (id) {
            messageIdToFetch = id;
        } else {
            throw new Error('Please provide either an ID or thread ID');
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URI
        );

        oauth2Client.setCredentials({
            access_token: process.env.GMAIL_ACCESS_TOKEN,
            refresh_token: process.env.GMAIL_REFRESH_TOKEN,
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const messageResponse = await gmail.users.messages.get({ userId: 'me', id: messageIdToFetch });
        const { id: messageId, threadId: msgThreadId, snippet, payload } = messageResponse.data;
        const headers = payload.headers;

        let sender = '';
        let to = '';
        let subject = '';
        let date = '';

        headers.forEach(header => {
            switch (header.name) {
                case 'From':
                    sender = header.value;
                    break;
                case 'To':
                    to = header.value;
                    break;
                case 'Subject':
                    subject = header.value;
                    break;
                case 'Date':
                    date = header.value;
                    break;
                default:
                    break;
            }
        });

        const messageContent = {
            id: messageId,
            threadId: msgThreadId,
            snippet,
            sender,
            to,
            subject,
            date,
            payload,
        };

        return new Response(JSON.stringify(messageContent), { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return new Response('Error fetching email', { status: 500 });
    }
}
