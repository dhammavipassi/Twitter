// src/lib/tweet-cache.ts

import { fetchTweet, Tweet } from 'react-tweet/api';
import { get, set } from '@vercel/edge-config';

export async function getTweet(
  id: string,
  fetchOptions?: RequestInit
): Promise<Tweet | undefined> {
  try {
    // 首先尝试从缓存中获取推文
    const cachedTweet = await get(`tweet:${id}`);
    if (cachedTweet) {
      return cachedTweet as Tweet;
    }

    // 如果缓存中没有，使用 fetchTweet 获取推文
    const { data, tombstone, notFound } = await fetchTweet(id, fetchOptions);

    if (data) {
      // 将获取到的推文存入缓存
      await set(`tweet:${id}`, data);
      return data;
    } else if (tombstone || notFound) {
      // 如果推文不存在或已被删除，缓存一个空值
      await set(`tweet:${id}`, null);
    }
  } catch (error) {
    console.error('获取推文失败:', error);
  }

  // 最后再次尝试从缓存中获取推文（如果之前的 fetch 失败）
  const cachedTweet = await get(`tweet:${id}`);
  return cachedTweet ? (cachedTweet as Tweet) : undefined;
}