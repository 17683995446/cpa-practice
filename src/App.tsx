import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Topic from "@/pages/Topic";
import Quiz from "@/pages/Quiz";
import Results from "@/pages/Results";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topic/:id" element={<Topic />} />
        <Route path="/quiz/:topicId/:index" element={<Quiz />} />
        <Route path="/results/:id" element={<Results />} />
      </Routes>
    </Router>
  );
}
