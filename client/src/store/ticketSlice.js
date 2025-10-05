import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchTickets = createAsyncThunk('tickets/fetch', async (filters = {}) => {
  const response = await api.get('/tickets', { params: filters });
  return response.data.tickets;
});

export const fetchTicketById = createAsyncThunk('tickets/fetchById', async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}`);
  return response.data.ticket;
});

export const createTicket = createAsyncThunk('tickets/create', async (ticketData) => {
  const response = await api.post('/tickets', ticketData);
  return response.data.ticket;
});

export const updateTicket = createAsyncThunk('tickets/update', async ({ ticketId, updateData }) => {
  const response = await api.patch(`/tickets/${ticketId}`, updateData);
  return response.data.ticket;
});

export const deleteTicket = createAsyncThunk('tickets/delete', async (ticketId) => {
  await api.delete(`/tickets/${ticketId}`);
  return ticketId;
});

export const addComment = createAsyncThunk('tickets/addComment', async ({ ticketId, content }) => {
  const response = await api.post(`/tickets/${ticketId}/comments`, { content });
  return response.data.comment;
});

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: [],
    currentTicket: null,
    loading: false,
  },
  reducers: {
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.tickets = action.payload;
        state.loading = false;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.currentTicket = action.payload;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.tickets.unshift(action.payload);
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.tickets[index] = action.payload;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.tickets = state.tickets.filter(t => t.id !== action.payload);
      })
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentTicket) {
          state.currentTicket.comments.unshift(action.payload);
        }
      });
  },
});

export const { clearCurrentTicket } = ticketSlice.actions;
export default ticketSlice.reducer;