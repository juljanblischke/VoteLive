const BASE = ""

export interface PollResponse {
  id: number
  title: string
  description: string | null
  isMultipleChoice: boolean
  shareCode: string
  createdAt: string
  options: { id: number; text: string }[]
}

export interface ResultsResponse {
  title: string
  description: string | null
  totalVotes: number
  options: { id: number; text: string; votes: number }[]
}

export async function createPoll(data: {
  title: string
  description?: string
  isMultipleChoice: boolean
  options: string[]
}): Promise<PollResponse> {
  const res = await fetch(`${BASE}/api/polls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json()).error || "Failed to create poll")
  return res.json()
}

export async function getPoll(shareCode: string): Promise<PollResponse> {
  const res = await fetch(`${BASE}/api/polls/${shareCode}`)
  if (!res.ok) throw new Error("Poll not found")
  return res.json()
}

export async function vote(shareCode: string, optionIds: number[]): Promise<void> {
  const res = await fetch(`${BASE}/api/polls/${shareCode}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionIds }),
  })
  if (!res.ok) throw new Error((await res.json()).error || "Failed to vote")
}

export async function getResults(shareCode: string): Promise<ResultsResponse> {
  const res = await fetch(`${BASE}/api/polls/${shareCode}/results`)
  if (!res.ok) throw new Error("Results not found")
  return res.json()
}
