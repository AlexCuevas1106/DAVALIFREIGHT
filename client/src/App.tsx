import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "@/pages/dashboard";
import ExpensesReport from "@/pages/expenses-report";
import Documents from "@/pages/documents";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses-report" element={<ExpensesReport />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;