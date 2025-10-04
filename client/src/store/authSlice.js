import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;
    
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { user };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Login failed. Please try again.');
  }
});

export const registerUser = createAsyncThunk('auth/register', async ({ name, email, password, adminCode }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', { name, email, password, adminCode });
    const { user, token } = response.data;
    
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { user };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Registration failed. Please try again.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    initializeAuth: (state) => {
      const token = sessionStorage.getItem('token');
      const userData = sessionStorage.getItem('user');
      
      if (token && userData) {
        state.user = JSON.parse(userData);
        state.isAuthenticated = true;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      state.loading = false;
    },
    logout: (state) => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      });
  },
});

export const { initializeAuth, logout } = authSlice.actions;
export default authSlice.reducer;