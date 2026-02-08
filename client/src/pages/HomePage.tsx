import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { BarChart3, Share2, Zap, Vote } from "lucide-react"

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8">
            <Zap className="w-4 h-4" />
            Real-time voting powered by SignalR
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Create polls.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Get answers.
            </span>
          </h1>

          <p className="text-xl text-muted mb-10 max-w-xl mx-auto">
            Beautiful real-time polls with live-updating charts. Share a link, collect votes, watch results come in instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/create")} className="text-base">
              <Vote className="w-5 h-5 mr-2" />
              Create a Poll
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-border py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Real-time", desc: "Votes appear instantly with live WebSocket updates" },
            { icon: Share2, title: "Easy Sharing", desc: "Share a short link -- no sign-up required to vote" },
            { icon: BarChart3, title: "Live Charts", desc: "Beautiful animated charts update as votes come in" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center text-sm text-muted">
        VoteLive v1.0 -- Auto-deployed via CI/CD
      </footer>
    </div>
  )
}
