import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { createPoll } from "@/lib/api"
import { Plus, Trash2, ArrowLeft } from "lucide-react"

export default function CreatePollPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [isMultipleChoice, setIsMultipleChoice] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const addOption = () => {
    if (options.length < 10) setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, value: string) => {
    setOptions(options.map((o, i) => (i === index ? value : o)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean)
    if (!title.trim()) return setError("Title is required")
    if (trimmedOptions.length < 2) return setError("At least 2 options are required")

    setLoading(true)
    try {
      const poll = await createPoll({
        title: title.trim(),
        description: description.trim() || undefined,
        isMultipleChoice,
        options: trimmedOptions,
      })
      navigate(`/poll/${poll.shareCode}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted hover:text-foreground mb-6 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Create a Poll</h1>
            <p className="text-muted text-sm mt-1">Fill in the details and share with anyone</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Question</label>
                <Input placeholder="What's your favorite...?" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
                <Input placeholder="Add some context..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Options</label>
                <div className="space-y-2">
                  {options.map((option, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder={`Option ${i + 1}`} value={option} onChange={(e) => updateOption(i, e.target.value)} />
                      {options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} className="p-2.5 text-muted hover:text-danger transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 10 && (
                  <button type="button" onClick={addOption} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 mt-3 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" /> Add option
                  </button>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-colors ${isMultipleChoice ? "bg-primary" : "bg-border"} relative`}
                  onClick={() => setIsMultipleChoice(!isMultipleChoice)}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isMultipleChoice ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <span className="text-sm">Allow multiple choices</span>
              </label>

              {error && <p className="text-danger text-sm">{error}</p>}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Poll"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
