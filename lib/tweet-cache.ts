import { fetchTweet, Tweet } from 'react-tweet/api'
import { kv } from '@vercel/kv'

export async function getTweet(
  id: string,
  fetchOptions?: RequestInit
): Promise<Tweet | undefined> {
  try {
    const { data, tombstone, notFound } = await fetchTweet(id, fetchOptions)

    if (data) {
      await kv.set(`tweet:${id}`, data)
      return data
    } else if (tombstone || notFound) {
      await kv.del(`tweet:${id}`)
    }
  } catch (error) {
    console.error('获取推文失败:', error)
  }

  const cachedTweet = await kv.get<Tweet>(`tweet:${id}`)
  return cachedTweet ?? undefined
}