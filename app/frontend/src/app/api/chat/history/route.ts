import { getApiChats, deleteApiChatsById, patchApiChatsById } from '@/lib/api-client';
import { serverClient } from '@/lib/chat/server-client';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '50', 10);
		const offset = parseInt(searchParams.get('offset') || '0', 10);

		const { data } = await getApiChats({
			query: { limit, offset },
			client: serverClient,
		});
		return Response.json(data);
	} catch (error) {
		console.error('Chat history API error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

export async function PATCH(request: Request) {
	try {
		const { id, title } = await request.json();

		if (!id || !title) {
			return new Response(JSON.stringify({ error: 'Chat ID and title are required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const { data } = await patchApiChatsById({
			path: { id },
			body: { title: title.trim() },
			client: serverClient,
		});
		return Response.json(data);
	} catch (error) {
		console.error('Chat rename API error:', error);
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

		await deleteApiChatsById({
			path: { id },
			client: serverClient,
		});
		return new Response(null, { status: 204 });
	} catch (error) {
		console.error('Chat delete API error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
