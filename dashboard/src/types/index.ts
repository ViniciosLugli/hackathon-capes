import { Article, Topic } from '@prisma/client'

export type ArticleCreateInput = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>
export type ArticleUpdateInput = Partial<ArticleCreateInput>

export type TopicCreateInput = Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>
export type TopicUpdateInput = Partial<TopicCreateInput>
