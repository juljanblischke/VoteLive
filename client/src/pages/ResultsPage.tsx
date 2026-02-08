import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { getResults, ResultsResponse } from "@/lib/api"
import { useSignalR } from "@/lib/useSignalR"
import { ArrowLeft, Copy, Check, Users, Vote } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from "recharts"

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#06b6d4"]

export default function ResultsPage() {
  const { shareCode } = useParams<{ shareCode: string }>()
  const navigate = useNavigate()
  const [results, setResults] = useState<ResultsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!shareCode) return
    getResults(shareCode).then(setResults).catch(() => {}).finally(() => setLoading(false))
  }, [shareCode])

  useSignalR(shareCode, (data) => setResults(data))

  const copyLink = () => {
    const voteUrl = window.location.href.replace("/results", "")
    navigator.clipboard.writeText(voteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted">Loading results...</div></div>
  if (!results) return <div className="min-h-screen flex items-center justify-center"><p className="text-danger">Could not load results</p></div>

  const chartData = results.options.map((o, i) => ({
    name: o.text.length > 20 ? o.text.slice(0, 20) + "..." : o.text,
    fullName: o.text,
    votes: o.votes,
    fill: COLORS[i % COLORS.length],
  }))

  const maxVotes = Math.max(...results.options.map((o) => o.votes), 1)

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <button onClick={copyLink} className="flex items-center gap-2 text-muted hover:text-foreground transition-colors cursor-pointer">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{copied ? "Copied vote link!" : "Share poll"}</span>
          </button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <h1 className="text-2xl font-bold">{results.title}</h1>
            {results.description && <p className="text-muted text-sm mt-1">{results.description}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{results.totalVotes} votes</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Bar Chart */}
            <div className="h-64 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" domain={[0, maxVotes]} hide />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#94a3b8", fontSize: 13 }} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
                          <p className="font-medium text-sm">{d.fullName}</p>
                          <p className="text-muted text-xs">{d.votes} votes</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="votes" radius={[0, 6, 6, 0]} animationDuration={600}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart */}
            {results.totalVotes > 0 && (
              <div className="h-48 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="votes" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} animationDuration={600} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Vote bars */}
            <div className="space-y-3">
              {results.options.map((option, i) => {
                const pct = results.totalVotes > 0 ? (option.votes / results.totalVotes) * 100 : 0
                return (
                  <div key={option.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{option.text}</span>
                      <span className="text-muted">{option.votes} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-3 rounded-full bg-background/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate(`/poll/${shareCode}`)}>
            <Vote className="w-4 h-4 mr-2" /> Vote
          </Button>
          <Button onClick={() => navigate("/create")}>
            Create New Poll
          </Button>
        </div>
      </div>
    </div>
  )
}
