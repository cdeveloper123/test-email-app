import { getSession } from '@auth0/nextjs-auth0';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

export async function GET() {

    const config = {
        imap: {
            user: process.env.OUTLOOK_EMAIL,
            password: process.env.OUTLOOK_PASSWORD,
            host: process.env.OUTLOOK_IMAP_HOST,
            port: process.env.OUTLOOK_IMAP_PORT,
            tls: true,
            authTimeout: 3000,
        },
    };

    try {
        const connection = await imaps.connect({ imap: config.imap });
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: false,
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        const emails = [];

        for (let message of messages) {

            const all = message.parts.find(part => part.which === 'TEXT');
            const header = message.parts.find(part => part.which === 'HEADER');
            const id = message.attributes.uid;
            const idHeader = 'Imap-Id: ' + id + '\r\n';
            const mail = await simpleParser(idHeader + (all ? all.body : ''));
            let extractedText = mail.text.match(/^(.*?)(?=--)/s)[1].trim() ?? mail.text;

            emails.push({
                id,
                subject: header.body.subject[0] || '(No Subject)',
                from: header.body.from[0] ? header.body.from[0] : '(Unknown Sender)',
                to: mail.to ? mail.to.map(addr => addr.address) : [],
                date: header.body.date[0] || '(No Date)',
                text: extractedText || '(No Text)',
                html: mail.html || '(No HTML)',
            });
        }

        connection.end();
        return new Response(JSON.stringify(emails), { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return new Response('Error fetching emails', { status: 500 });
    }
}
