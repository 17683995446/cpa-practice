import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Topic from '@/pages/Topic';
import Quiz from '@/pages/Quiz';
import Results from '@/pages/Results';
import Documentation from '@/pages/Documentation';
import WrongQuestions from '@/pages/WrongQuestions';
import FavouriteQuestions from '@/pages/FavouriteQuestions';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topic/:id" element={<Topic />} />
        <Route path="/quiz/:topicId/:index" element={<Quiz />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/wrong-questions" element={<WrongQuestions />} />
        <Route path="/favourite-questions" element={<FavouriteQuestions />} />
      </Routes>
    </Router>
  );
}
