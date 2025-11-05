import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Consonants } from "@/components/Consonants";
import { Numbers } from "@/components/Numbers";

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-border bg-background">
      <div className="flex h-16">
        <Link
          to="/"
          className={`flex flex-1 items-center justify-center font-base transition-colors ${
            location.pathname === "/"
              ? "bg-main text-main-foreground"
              : "text-foreground hover:bg-secondary-background"
          }`}
        >
          Consonants
        </Link>
        <Link
          to="/numbers"
          className={`flex flex-1 items-center justify-center font-base transition-colors ${
            location.pathname === "/numbers"
              ? "bg-main text-main-foreground"
              : "text-foreground hover:bg-secondary-background"
          }`}
        >
          Numbers
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter basename="/learn-thai-app">
      <div className="min-h-svh bg-background pb-16">
        <Routes>
          <Route path="/" element={<Consonants />} />
          <Route path="/numbers" element={<Numbers />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;