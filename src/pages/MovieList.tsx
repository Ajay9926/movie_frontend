import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

interface Movie {
  id: number;
  title: string;
  type: string;
  director: string;
  budget: string;
  location: string;
  duration: string;
  year: string;
  image?: string;
}

const MovieList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const fetchMovies = useCallback(
    async (pageNum: number, search = "") => {
      if (!token) return;
      setLoading(true);

      try {
        const response = await axios.get(
          `${baseURL}api/movies?page=${pageNum}&limit=10&search=${search}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const newMovies =
          response.data.movies || response.data.data || response.data || [];

        if (pageNum === 1) {
          setMovies(newMovies);
        } else {
          setMovies((prev) => [...prev, ...newMovies]);
        }

        setHasMore(newMovies.length === 10);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    },
    [baseURL, token]
  );

  useEffect(() => {
    if (token) {
      fetchMovies(1, searchQuery);
      setPage(1);
    }
  }, [token, searchQuery, fetchMovies]);

  const lastMovieElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => {
            const newPage = prevPage + 1;
            fetchMovies(newPage, searchQuery);
            return newPage;
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchMovies, searchQuery]
  );

  const handleDelete = async () => {
    if (!movieToDelete || !token) return;

    try {
      await axios.delete(`${baseURL}api/movies/${movieToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMovies((prev) => prev.filter((movie) => movie.id !== movieToDelete));
      setDeleteDialogOpen(false);
      setMovieToDelete(null);

      toast.success("Movie deleted successfully", { theme: "colored" });
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast.error("Failed to delete movie", { theme: "colored" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Movies & TV Shows
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <TextField
            placeholder="Search by title, director, or type..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: "400px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/movies/add")}
          >
            Add New Movie/Show
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Image</TableCell>
                <TableCell>
                  <strong>Title</strong>
                </TableCell>
                <TableCell>
                  <strong>Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Director</strong>
                </TableCell>
                <TableCell>
                  <strong>Budget</strong>
                </TableCell>
                <TableCell>
                  <strong>Location</strong>
                </TableCell>
                <TableCell>
                  <strong>Duration</strong>
                </TableCell>
                <TableCell>
                  <strong>Year/Time</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movies.map((movie, index) => (
                <TableRow
                  key={movie.id}
                  ref={index === movies.length - 1 ? lastMovieElementRef : null}
                  sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                >
                  <TableCell>
                    {(() => {
                      const storedImage = localStorage.getItem(`movieImage_${movie.id}`);

                      if (storedImage) {
                        return (
                          <img
                            src={storedImage}
                            alt={movie.title}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        );
                      } else if (movie.image) {
                        return (
                          <img
                            src={movie.image}
                            alt={movie.title}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        );
                      } else {
                        return (
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              backgroundColor: "#e0e0e0",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            N/A
                          </Box>
                        );
                      }
                    })()}
                  </TableCell>


                  <TableCell>{movie.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={movie.type}
                      color={movie.type === "Movie" ? "primary" : "secondary"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{movie.director}</TableCell>
                  <TableCell>{movie.budget}</TableCell>
                  <TableCell>{movie.location}</TableCell>
                  <TableCell>{movie.duration}</TableCell>
                  <TableCell>{movie.year}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        navigate(`/movies/edit/${movie.id}`, {
                          state: { movie },
                        })
                      }
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => {
                        setMovieToDelete(movie.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && movies.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" color="textSecondary">
              No movies or shows found. Add your first entry!
            </Typography>
          </Box>
        )}
      </Container>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this movie/show? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MovieList;
