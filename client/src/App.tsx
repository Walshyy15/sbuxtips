import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { Coffee } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-[hsl(var(--md-sys-color-surface))]">
          <header className="bg-[hsl(var(--starbucks-green))] text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center gap-3">
                <Coffee className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">TipJar</h1>
                  <p className="text-sm text-white/80">Starbucks Tip Distribution Calculator</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
            <Router />
          </main>

          <footer className="bg-white border-t border-[hsl(var(--md-sys-color-outline))] mt-auto py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
              <div className="font-semibold text-[hsl(var(--starbucks-green))]">Made by William Walsh</div>
              <div className="text-[hsl(var(--starbucks-gray))] text-sm mt-1">Starbucks Store #69600</div>
            </div>
          </footer>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
