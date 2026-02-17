import { chatApi } from '@/lib/chat/api';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '50', 10);
		const offset = parseInt(searchParams.get('offset') || '0', 10);

		const result = await chatApi.listChats(limit, offset);
		return Response.json(result);
	} catch (error) {
		console.error('Chat history API error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

export async function DELETE(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return new Response(JSON.stringify({ error: 'Chat ID is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		await chatApi.deleteChat(id);
		return new Response(null, { status: 204 });
	} catch (error) {
		console.error('Chat delete API error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
