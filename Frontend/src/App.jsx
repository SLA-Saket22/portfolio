import { Routes, Route } from "react-router-dom";
import  HomePage  from "./HomePag";
import  ContactForm  from "./cantactForm";
import AdminDashboard from "./AdminDashboard";

function App() {
  return (
    <Routes>
      {/* 🌐 Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/AdminDashboard" element={<AdminDashboard/>} />
      <Route path="/contact" element={<ContactForm />} /> 
    </Routes>
  );
}

export default App;