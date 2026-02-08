import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { getPoll, vote, PollResponse } from "@/lib/api"
import { ArrowLeft, Check, Copy } from "lucide-react"

export default function VotePage() {
  const { shareCode } = useParams<{ shareCode: string }>()
  const navigate = useNavigate()
  const [poll, setPoll] = useState<PollResponse | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [voted, setVoted] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!shareCode) return
    getPoll(shareCode).then(setPoll).catch(() => setError("Poll not found")).finally(() => setLoading(false))
  }, [shareCode])

  const toggleOption = (id: number) => {
    const next = new Set(selected)
    if (poll?.isMultipleChoice) {
      next.has(id) ? next.delete(id) : next.add(id)
    } else {
      next.clear()
      next.add(id)
    }
    setSelected(next)
  }

  const handleVote = async () => {
    if (!shareCode || selected.size === 0) return
    setVoting(true)
    try {
      await vote(shareCode, Array.from(selected))
      setVoted(true)
      setTimeout(() => navigate(`/poll/${shareCode}/results`), 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
    } finally {
      setVoting(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted">Loading...</div></div>
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-danger">{error}</p></div>
  if (!poll) return null

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <button onClick={copyLink} className="flex items-center gap-2 text-muted hover:text-foreground transition-colors cursor-pointer">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>

        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">{poll.title}</h1>
            {poll.description && <p className="text-muted text-sm mt-1">{poll.description}</p>}
            <p className="text-xs text-muted mt-2">
              {poll.isMultipleChoice ? "Select one or more options" : "Select one option"}
            </p>
          </CardHeader>
          <CardContent>
            {voted ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium">Vote recorded!</p>
                <p className="text-muted text-sm mt-1">Redirecting to results...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selected.has(option.id)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 ${poll.isMultipleChoice ? "rounded-md" : "rounded-full"} border-2 flex items-center justify-center ${
                        selected.has(option.id) ? "border-primary bg-primary" : "border-muted"
                      }`}>
                        {selected.has(option.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {option.text}
                    </div>
                  </button>
                ))}

                <Button onClick={handleVote} size="lg" className="w-full mt-4" disabled={voting || selected.size === 0}>
                  {voting ? "Voting..." : "Cast Vote"}
                </Button>

                <button onClick={() => navigate(`/poll/${shareCode}/results`)} className="w-full text-center text-sm text-muted hover:text-foreground mt-2 transition-colors cursor-pointer">
                  View results without voting
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
