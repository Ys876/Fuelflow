import React, { useState } from 'react';
import {
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  alpha,
  useTheme,
  Alert,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../../context/AuthContext';

const MealRecommendation = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [diningCourt, setDiningCourt] = useState('');
  const [mealType, setMealType] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuError, setMenuError] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  const diningCourts = [
    'Windsor',
    'Hillenbrand',
    'Earhart',
    'Wiley',
    'Ford'
  ];

  const mealTypes = [
    'Breakfast',
    'Brunch',
    'Lunch',
    'Late Lunch',
    'Dinner'
  ];

  const fetchMenu = async () => {
    try {
      const response = await fetch(`http://localhost:5002/api/menu?diningCourt=${diningCourt}&mealType=${mealType}`);
      const data = await response.json();
      
      if (data.error) {
        setMenuError(data.error);
        setMenuItems([]);
        return false;
      }
      
      if (!data.items || !Array.isArray(data.items)) {
        setMenuError('Invalid menu data received');
        setMenuItems([]);
        return false;
      }

      console.log('Fetched menu data:', data); // Debug log
      setMenuItems(data.items);
      setMenuError('');
      return true;
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuError('Failed to fetch menu. Please try again.');
      return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setRecommendations(null);
    
    try {
      // First fetch the menu
      const menuFetched = await fetchMenu();
      if (!menuFetched) {
        setLoading(false);
        return;
      }

      console.log('Menu items:', menuItems); // Debug log

      // Then analyze the meals
      const response = await fetch('http://localhost:5002/api/analyze-meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diningCourt,
          mealItems: menuItems.map(item => item.name)
        }),
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Error response:', errorData); // Debug log
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      console.log('Recommendations data:', data); // Debug log
      setRecommendations(data);
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Meal Recommendations
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Dining Court</InputLabel>
              <Select
                value={diningCourt}
                label="Dining Court"
                onChange={(e) => setDiningCourt(e.target.value)}
              >
                {diningCourts.map((court) => (
                  <MenuItem key={court} value={court}>
                    {court}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Meal Type</InputLabel>
              <Select
                value={mealType}
                label="Meal Type"
                onChange={(e) => setMealType(e.target.value)}
              >
                {mealTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!diningCourt || !mealType || loading}
            sx={{ 
              bgcolor: theme.palette.secondary.main,
              '&:hover': {
                bgcolor: theme.palette.secondary.dark,
              }
            }}
          >
            Get Recommendations
          </Button>
        </Box>
      </Paper>

      {menuError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {menuError}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {recommendations && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Analysis Results
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Recommended Items
                  </Typography>
                  <List>
                    {recommendations.recommended_items.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    Nutritional Analysis
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <RestaurantIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Protein-Rich Options"
                        secondary={recommendations.nutritional_analysis.protein_rich.join(', ')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <RestaurantIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Vegetarian Options"
                        secondary={recommendations.nutritional_analysis.vegetarian.join(', ')}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    Dining Court Rating: {recommendations.dining_court_rating}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    Estimated Wait Time: {recommendations.wait_time_estimate}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default MealRecommendation;
