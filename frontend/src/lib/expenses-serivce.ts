import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface ExpenseRequest {
  trip_id: string;
  name: string;
  amount: number;
  expense_type: string;
  paid_by: string;
  split_between: string[];
  percentages: Record<string, number>;
}

interface ExpenseResponse {
  id: number;
  trip_id: string;
  name: string;
  amount: number;
  expense_type: string;
  paid_by: string;
  split_between: string[];
  percentages: Record<string, number>;
  trip_name: string;
  created_at: string;
}

export const addExpenseToSupabase = async (
  supabase: SupabaseClient,
  expenseData: ExpenseRequest
): Promise<void> => {
  try {
    const { error } = await supabase.from('expenses').insert([expenseData]);

    if (error) {
      console.error('Error adding expense:', error);
    } else {
      console.log('Expense added successfully:', expenseData);
      toast.success('Expense added successfully');
    }
  } catch (err) {
    console.error('Unexpected error while adding expense:', err);
  }
};

export const fetchExpensesForTrip = async (
  supabase: SupabaseClient,
  tripId: string
): Promise<Record<string, ExpenseResponse[]>> => {
  if (!tripId) {
    return {};
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, trips (tripname)')
      .eq('trip_id', tripId)
      .order('id', { ascending: true });

    if (error) throw error;

    const mappedExpenses: ExpenseResponse[] =
      data?.map((item: any) => ({
        id: item.id,
        trip_id: item.trip_id,
        name: item.name,
        amount: item.amount,
        expense_type: item.expense_type,
        paid_by: item.paid_by,
        split_between: item.split_between,
        percentages: item.percentages,
        trip_name: item.trips.tripname,
        created_at: item.created_at,
      })) || [];

    return { [tripId]: mappedExpenses };
  } catch (err) {
    console.error('Failed to fetch expenses:', err);
    throw new Error('Failed to fetch expenses');
  }
};
