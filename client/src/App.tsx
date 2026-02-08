import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import CreatePollPage from "./pages/CreatePollPage"
import VotePage from "./pages/VotePage"
import ResultsPage from "./pages/ResultsPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePollPage />} />
        <Route path="/poll/:shareCode" element={<VotePage />} />
        <Route path="/poll/:shareCode/results" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
