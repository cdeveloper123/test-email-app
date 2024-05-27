import { getSession } from '@auth0/nextjs-auth0';

export async function GET(request) {
    const { user } = await getSession(request);
    if (!user) {
        return new Response('Not Authenticated', { status: 401 });
    }

    const urlObject = new URL(request.url)

    const mailId = urlObject.searchParams.get('emailId');

    try {
        const response = await fetch(`${process.env.BASE_URL}/api/outlook/getEmails`);

        if (!response.ok) {
            throw new Error('Failed to fetch Outlook emails');
        }

        const data = await response.json();
        var mail = data.filter((d) => d.id === +mailId)
        return new Response(JSON.stringify(mail), { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return new Response('Error fetching email', { status: 500 });
    }
}
