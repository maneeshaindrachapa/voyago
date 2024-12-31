import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTripContext } from './TripContext';
import { fetchExpensesForTrip } from '../lib/expenses-serivce';

interface Expense {
  id: number;
  trip_id: string;
  name: string;
  amount: number;
  expense_type: string;
  paid_by: string;
  split_between: string[];
  trip_name: string;
}

interface ExpenseContextData {
  expenses: Record<string, Expense[]>;
  loading: boolean;
  error: string | null;
  fetchExpenses: (tripId: string) => Promise<void>;
  handleRefresh: () => void;
}

const ExpenseContext = createContext<ExpenseContextData | undefined>(undefined);

export const useExpenseContext = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenseContext must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expenses, setExpenses] = useState<Record<string, Expense[]>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClerkSupabaseClient();
  const { selectedTrip } = useTripContext();

  const fetchExpenses = async (tripId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchExpensesForTrip(supabase, tripId);
      setExpenses((prev) => ({ ...prev, ...result }));
    } catch (err) {
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (selectedTrip?.id) {
      fetchExpenses(selectedTrip.id);
    } else {
      setExpenses({});
    }
  }, [selectedTrip?.id, refreshKey]);

  return (
    <ExpenseContext.Provider
      value={{ expenses, loading, error, fetchExpenses, handleRefresh }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
