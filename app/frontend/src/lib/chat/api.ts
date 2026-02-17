const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const chatApi = {
	async createChat(data: { id?: string; title?: string }) {
		const res = await fetch(`${BACKEND_URL}/api/chats`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error('Failed to create chat');
		return res.json();
	},

	async getChat(id: string) {
		const res = await fetch(`${BACKEND_URL}/api/chats/${id}`);
		if (!res.ok) {
			if (res.status === 404) return null;
			throw new Error('Failed to get chat');
		}
		return res.json();
	},

	async listChats(limit = 50, offset = 0) {
		const res = await fetch(`${BACKEND_URL}/api/chats?limit=${limit}&offset=${offset}`);
		if (!res.ok) throw new Error('Failed to list chats');
		return res.json();
	},

	async deleteChat(id: string) {
		const res = await fetch(`${BACKEND_URL}/api/chats/${id}`, {
			method: 'DELETE',
		});
		if (!res.ok && res.status !== 204) throw new Error('Failed to delete chat');
		return true;
	},

	async addMessage(chatId: string, data: { id?: string; role: string; content: string }) {
		const res = await fetch(`${BACKEND_URL}/api/chats/${chatId}/messages`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error('Failed to add message');
		return res.json();
	},

	async updateChatTitle(id: string, title: string) {
		const res = await fetch(`${BACKEND_URL}/api/chats/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title }),
		});
		if (!res.ok) throw new Error('Failed to update chat title');
		return res.json();
	},
};
