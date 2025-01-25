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
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  // This would come from your web scraping
  const mockMealItems = {
    'Windsor': {
      'Breakfast': ['Eggs', 'Pancakes', 'Bacon', 'Oatmeal', 'Fresh Fruit'],
      'Lunch': ['Pizza', 'Salad Bar', 'Grilled Chicken', 'Rice', 'Vegetables'],
      'Dinner': ['Pasta', 'Steak', 'Fish', 'Roasted Vegetables', 'Ice Cream']
    },
    // Add other dining courts...
  };

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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Get the available meal items for the selected dining court and meal
      const mealItems = mockMealItems[diningCourt][mealType] || [];
      
      // Get the user's current cycle phase from context
      const cyclePhase = user?.cycleInfo?.currentPhase || 'menstrual';

      const response = await fetch('http://localhost:5001/api/analyze-meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diningCourt,
          mealItems,
          cyclePhase,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get meal recommendations. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          textAlign: 'center',
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4,
          fontWeight: 'bold',
        }}
      >
        Personalized Meal Recommendations
      </Typography>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Dining Court</InputLabel>
              <Select
                value={diningCourt}
                label="Dining Court"
                onChange={(e) => setDiningCourt(e.target.value)}
              >
                {diningCourts.map((court) => (
                  <MenuItem key={court} value={court}>{court}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Meal Type</InputLabel>
              <Select
                value={mealType}
                label="Meal Type"
                onChange={(e) => setMealType(e.target.value)}
              >
                {mealTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{
            mt: 3,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            },
          }}
          disabled={!diningCourt || !mealType || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
        </Button>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {recommendations && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Your Cycle Phase: <Chip 
                label={user?.cycleInfo?.currentPhase || 'Calculating...'}
                color="secondary"
                sx={{ ml: 1 }}
              />
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              }}
            >
              <CardContent>
                <Typography variant="h6" color="success.main" gutterBottom>
                  Recommended Foods
                </Typography>
                <List>
                  {recommendations.recommended.map((item, index) => (
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
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
              }}
            >
              <CardContent>
                <Typography variant="h6" color="error" gutterBottom>
                  Foods to Avoid
                </Typography>
                <List>
                  {recommendations.notRecommended.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CancelIcon color="error" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detailed Analysis
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {recommendations.explanation}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default MealRecommendation;
