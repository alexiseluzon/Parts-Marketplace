import { ApolloProvider } from "@apollo/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { client } from "./lib/apolloClient";
import { AuthProvider } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { PartsPage } from "./pages/PartsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route
              path="/parts"
              element={
                <ProtectedRoute>
                  <PartsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/parts" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}
