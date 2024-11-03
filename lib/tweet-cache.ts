import { fetchTweet, Tweet } from 'react-tweet/api'
import { get, set } from '@vercel/edge-config'

export async function getTweet(
  id: string,
  fetchOptions?: RequestInit
): Promise<Tweet | undefined> {
  try {
    const { data, tombstone, notFound } = await fetchTweet(id, fetchOptions)
    if (data) {
      await set(`tweet:${id}`, data)
      return data
    } else if (tombstone || notFound) {
      await set(`tweet:${id}`, null)
    }
  } catch (error) {
    console.error('获取推文失败:', error)
  }
  const cachedTweet = await get(`tweet:${id}`)
  return cachedTweet ?? undefined
}