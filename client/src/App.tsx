import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Fleet from "@/pages/Fleet";
import Routes from "@/pages/Routes";
import Schedule from "@/pages/Schedule";
import Finances from "@/pages/Finances";
import { GameProvider } from "@/contexts/GameContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 overflow-y-auto px-6 py-5 relative">
          <div className="absolute top-[-150px] right-[-150px] w-96 h-96 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-100px] left-[-100px] w-72 h-72 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
          {children}
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      </Route>
      <Route path="/fleet">
        {() => (
          <AppLayout>
            <Fleet />
          </AppLayout>
        )}
      </Route>
      <Route path="/routes">
        {() => (
          <AppLayout>
            <Routes />
          </AppLayout>
        )}
      </Route>
      <Route path="/schedule">
        {() => (
          <AppLayout>
            <Schedule />
          </AppLayout>
        )}
      </Route>
      <Route path="/finances">
        {() => (
          <AppLayout>
            <Finances />
          </AppLayout>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <Router />
        <Toaster />
      </GameProvider>
    </QueryClientProvider>
  );
}

export default App;
