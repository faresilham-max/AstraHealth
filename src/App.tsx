import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LiveProvider } from "./hooks/LiveContext";
import { AlertsProvider } from "./hooks/AlertsContext";
import SpaceBackground from "./components/SpaceBackground";
import EmergencyBanner from "./components/EmergencyBanner";
import Navbar from "./components/Navbar";
import Recorder from "./components/Recorder";
import ChatWidget from "./components/ChatWidget";
import Dashboard from "./pages/Dashboard";
import Astronaut from "./pages/Astronaut";
import MetricDetail from "./pages/MetricDetail";
import Predictions from "./pages/Predictions";
import Alerts from "./pages/Alerts";
import Chatbot from "./pages/Chatbot";
import Emergency from "./pages/Emergency";

function App() {
  return (
    <LiveProvider>
      <AlertsProvider>
        <SpaceBackground />
        <Recorder />
        <BrowserRouter>
          <EmergencyBanner />
          <Navbar />
          <main className="page">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/astronaut/:id" element={<Astronaut />} />
              <Route path="/astronaut/:id/:metric" element={<MetricDetail />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/chat" element={<Chatbot />} />
              <Route path="/emergency" element={<Emergency />} />
            </Routes>
          </main>
          <ChatWidget />
        </BrowserRouter>
      </AlertsProvider>
    </LiveProvider>
  );
}

export default App;