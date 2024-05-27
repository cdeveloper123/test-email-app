import { google } from 'googleapis';

export async function GET(req) {
    try {
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

        const response = await gmail.users.messages.list({ userId: 'me' });
        const messages = response.data.messages || [];

        const modifiedMessages = await Promise.all(messages.map(async message => {
            const messageId = message.id;
            const messageResponse = await gmail.users.messages.get({ userId: 'me', id: messageId });
            
            const { id, threadId, snippet, payload } = messageResponse.data;
            const headers = payload.headers;
            let sender = '';
            headers.forEach(header => {
                if (header.name === 'From') {
                    sender = header.value;
                }
            });

            return { id, threadId, snippet, sender };
        }));

        return new Response(JSON.stringify(modifiedMessages), { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return new Response('Error fetching emails', { status: 500 });
    }
}
