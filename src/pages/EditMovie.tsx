import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  MenuItem,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

const EditMovie = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    title: "",
    type: "Movie",
    director: "",
    budget: "",
    location: "",
    duration: "",
    year: "",
    imageBase64: "",
  });

  useEffect(() => {
    if (state?.movie) {
      const movie = state.movie;
      setFormData({
        title: movie.title,
        type: movie.type,
        director: movie.director,
        budget: movie.budget,
        location: movie.location,
        duration: movie.duration,
        year: movie.year,
        imageBase64: movie.imageUrl || "",
      });
      if (movie.imageUrl) setImagePreview(movie.imageUrl);
      setFetchLoading(false);
    } else {
      fetchMovie();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, id]);

  const fetchMovie = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${baseURL}api/movies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const movie = res.data.find((m: any) => m.id === Number(id));
      if (!movie) return toast.error("Movie not found");

      setFormData({
        title: movie.title,
        type: movie.type,
        director: movie.director,
        budget: movie.budget,
        location: movie.location,
        duration: movie.duration,
        year: movie.year,
        imageBase64: movie.imageUrl || "",
      });

      if (movie.imageUrl) setImagePreview(movie.imageUrl);
    } catch {
      toast.error("Failed to fetch movie details");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({ ...prev, imageBase64: base64 }));
        setImagePreview(base64);
        // Save preview image in localStorage temporarily
        if (id) localStorage.setItem(`movieImage_${id}`, base64);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const token = localStorage.getItem("token");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { imageBase64, ...textData } = formData;
  
      await axios.put(`${baseURL}api/movies/${id}`, textData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Update local image storage
      if (formData.imageBase64 && id) {
        localStorage.setItem(`movieImage_${id}`, formData.imageBase64);
      }
  
      toast.success("Movie/Show updated successfully!");
      navigate("/movies");
    } catch {
      toast.error("Failed to update movie/show");
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/movies")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Edit Movie/TV Show</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <MenuItem value="Movie">Movie</MenuItem>
                  <MenuItem value="TV Show">TV Show</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Director"
                  name="director"
                  value={formData.director}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Budget"
                  name="budget"
                  placeholder="e.g., $160M or $3M/ep"
                  value={formData.budget}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Location"
                  name="location"
                  placeholder="e.g., LA, Paris"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Duration"
                  name="duration"
                  placeholder="e.g., 148 min or 49 min/ep"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Year/Time"
                  name="year"
                  placeholder="e.g., 2010 or 2008-2013"
                  value={formData.year}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Upload New Image/Poster
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  {imagePreview && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: "200px", borderRadius: "8px" }} />
                  </Box>
                )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/movies")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Updating..." : "Update Movie/Show"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default EditMovie;
