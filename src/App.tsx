import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieList from "./pages/MovieList";
import AddMovie from "./pages/AddMovie";
import EditMovie from "./pages/EditMovie";
import PrivateRoute from "./components/PrivateRoute";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/movies"
              element={
                <PrivateRoute>
                  <MovieList />
                </PrivateRoute>
              }
            />
            <Route
              path="/movies/add"
              element={
                <PrivateRoute>
                  <AddMovie />
                </PrivateRoute>
              }
            />
            <Route
              path="/movies/edit/:id"
              element={
                <PrivateRoute>
                  <EditMovie />
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/movies" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            theme="colored"
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
