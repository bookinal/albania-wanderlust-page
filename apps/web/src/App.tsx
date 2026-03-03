import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/i18n";
import Index from "./pages/home/Index";
import OAuthSignInPage from "./pages/home/Auth";
import NotFound from "./pages/NotFound";
import Footer from "./components/home/Footer";
import CultureDetails from "./pages/home/CultureDetails";
import DestinationDetails from "./pages/home/DestinationDetails";
import PropertiesMapPage from "./pages/home/PropertiesMapPage";
import Dashboard from "./pages/dashboard/dashboard";
import AllHotels from "./pages/dashboard/Hotels/all-hotels";
import HotelDetails from "./pages/dashboard/Hotels/HotelDetails";
import AllCars from "./pages/dashboard/Cars/AllCars";
import UserManagement from "./pages/dashboard/Users/users-management";
import UserDetails from "./pages/dashboard/Users/user-details";
import MyAccount from "./pages/home/MyAccount";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import CarDetails from "./pages/dashboard/Cars/CarDetails";
import HotelReservation from "./pages/home/HotelReservation";
import SuspendedPage from "./pages/SuspendedPage";
import AllApartments from "./pages/dashboard/Apartments/all-apartmets";
import ApartmentDetails from "./pages/dashboard/Apartments/ApartmentDetails";
import SearchPropertyResults from "./pages/home/SearchPropertyResults/SearchPropertyResults";
import SearchCarResults from "./pages/home/SearchPropertyResults/SearchCarResults";
import ApartmentReservation from "./pages/home/booking/ApartmentReservation";
import CarReservation from "./pages/home/booking/CarReservation";
import CarBilling from "./pages/home/booking/CarBilling";
import BookingsSummary from "./pages/home/booking/BookingsSummary";
import ApartmentBilling from "./pages/home/booking/ApartmentBilling";
import BookingsManagement from "./pages/dashboard/bookings/BookingsManagement";
import ProviderRequest from "./pages/home/ProviderRequest";
import RequestsManagement from "./pages/dashboard/Requests/RequestsManagement";
import PropertyRequestsManagement from "./pages/dashboard/Requests/PropertyRequestsManagement";
import Wishlist from "./pages/home/Wishlist";
import DestinationsManagement from "./pages/dashboard/Destinations/DestinationsManagement";
import SupportChat from "./pages/dashboard/SupportChat";
import { UserChatWidget } from "./components/chat/UserChatWidget";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: 1,
      // Don't refetch on window focus by default (can override per query)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
  },
});

// PayPal Client ID - use sandbox for development, production for live
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";

const App = () => (
  <I18nextProvider i18n={i18n}>
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<OAuthSignInPage />} />
              <Route path="/myAccount" element={<MyAccount />} />
              <Route path="/CultureDetails" element={<CultureDetails />} />
              <Route path="/destination/:id" element={<DestinationDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/properties-map" element={<PropertiesMapPage />} />
              <Route
                path="/searchResults"
                element={<SearchPropertyResults />}
              />
              <Route path="/searchCarResults" element={<SearchCarResults />} />
              <Route
                path="/hotelReservation/:id"
                element={<HotelReservation />}
              />
              <Route
                path="/apartmentReservation/:id"
                element={<ApartmentReservation />}
              />
              <Route path="/carReservation/:id" element={<CarReservation />} />
              <Route path="/carBilling/:id" element={<CarBilling />} />
              <Route
                path="/apartmentBilling/:id"
                element={<ApartmentBilling />}
              />
              <Route path="/myBookings" element={<BookingsSummary />} />
              <Route path="/ProviderRequest" element={<ProviderRequest />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/HotelsList" element={<AllHotels />} />
                <Route
                  path="/dashboard/hotels/:id"
                  element={<HotelDetails />}
                />
                <Route
                  path="/dashboard/ApartmentsList"
                  element={<AllApartments />}
                />
                <Route
                  path="/dashboard/apartments/:id"
                  element={<ApartmentDetails />}
                />
                <Route path="/dashboard/carsList" element={<AllCars />} />
                <Route path="/dashboard/carInfo/:id" element={<CarDetails />} />
                <Route
                  path="/dashboard/userManagement"
                  element={<UserManagement />}
                />
                <Route
                  path="/dashboard/requestsManagement"
                  element={<RequestsManagement />}
                />
                <Route
                  path="/dashboard/propertyRequestsManagement"
                  element={<PropertyRequestsManagement />}
                />
                <Route
                  path="/dashboard/user-details/:userId"
                  element={<UserDetails />}
                />
                <Route
                  path="/dashboard/bookings"
                  element={<BookingsManagement />}
                />
                <Route
                  path="/dashboard/destinations"
                  element={<DestinationsManagement />}
                />
                <Route path="/dashboard/support" element={<SupportChat />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              <Route path="unauthorized" element={<Unauthorized />} />
              <Route path="/suspended" element={<SuspendedPage />} />
            </Routes>
            <UserChatWidget />
            <Footer />
          </BrowserRouter>
        </TooltipProvider>
        <SpeedInsights />
      </QueryClientProvider>
    </PayPalScriptProvider>
  </I18nextProvider>
);

export default App;
