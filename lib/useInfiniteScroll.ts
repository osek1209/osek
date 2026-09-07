'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const LIMIT = 20

export function useInfiniteScroll<T>(
  fetchUrl: (offset: number, limit: number) => string,
  initialItems: T[],
  initialTotal: number,
) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const offsetRef = useRef(initialItems.length)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const hasMore = items.length < total

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const res = await fetch(fetchUrl(offsetRef.current, LIMIT))
    if (res.ok) {
      const json = await res.json()
      const newItems: T[] = json.data ?? json
      setItems((prev) => [...prev, ...newItems])
      setTotal(json.total ?? total)
      offsetRef.current += newItems.length
    }
    setLoading(false)
  }, [loading, hasMore, fetchUrl, total])

  // Reset when fetchUrl changes (filter/search change)
  const reset = useCallback(async (url: (offset: number, limit: number) => string) => {
    setLoading(true)
    const res = await fetch(url(0, LIMIT))
    if (res.ok) {
      const json = await res.json()
      const newItems: T[] = json.data ?? json
      setItems(newItems)
      setTotal(json.total ?? 0)
      offsetRef.current = newItems.length
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return { items, setItems, total, loading, hasMore, sentinelRef, reset }
}
