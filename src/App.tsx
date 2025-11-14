import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Results from "./pages/Results";
import DestinationDetail from "./pages/DestinationDetail";
import Auth from "./pages/Auth";
import SavedTrips from "./pages/SavedTrips";
import CollaborativeTrips from "./pages/CollaborativeTrips";
import TripGroupDetail from "./pages/TripGroupDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/results" element={<Results />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/saved-trips" element={<SavedTrips />} />
          <Route path="/collaborative-trips" element={<CollaborativeTrips />} />
          <Route path="/collaborative-trips/:groupId" element={<TripGroupDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
