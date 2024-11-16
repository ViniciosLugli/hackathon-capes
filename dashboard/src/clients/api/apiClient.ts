import { ArticleCreateInput, ArticleUpdateInput } from '@/types'
import { Article } from '@prisma/client'

const API_BASE_URL = '/api'

export class ApiClient {
	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
		})

		if (!response.ok) {
			throw new Error(`API request failed: ${response.statusText}`)
		}

		return response.json()
	}

	async getArticles(query: string): Promise<Article[]> {
		const queryParams = new URLSearchParams({ q: query })
		const response = await this.request<{ data: Article[] }>('/articles?' + queryParams.toString())
		return response.data
	}

	async getArticle(id: string): Promise<Article> {
		return this.request(`/articles/${id}`)
	}

	async createArticle(article: ArticleCreateInput): Promise<Article> {
		return this.request('/articles', {
			method: 'POST',
			body: JSON.stringify(article),
		})
	}

	async updateArticle(id: string, article: ArticleUpdateInput): Promise<Article> {
		return this.request(`/articles/${id}`, {
			method: 'PUT',
			body: JSON.stringify(article),
		})
	}

	async deleteArticle(id: string): Promise<void> {
		await this.request(`/articles/${id}`, { method: 'DELETE' })
	}
}

export const apiClient = new ApiClient()
