import { Coins } from 'lucide-react';
import { useExpenseContext } from '../context/ExpensesContext';
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTripContext } from '../context/TripContext';
import { Skeleton } from './ui/skeleton';

const TripExpensesCard: React.FC = () => {
  const { selectedTrip } = useTripContext();
  const { expenses, loading, error } = useExpenseContext();
  const { user } = useUser();

  if (loading) {
    return (
      <div className="flex flex-col space-y-3 p-2 w-full">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-[5vh] w-full rounded-xl" />
      </div>
    );
  }

  const calculateBalances = () => {
    let totalOwed = 0;
    let totalSpent = 0;
    let totalTrip = 0;

    const tripId: string | undefined = selectedTrip?.id;
    const tripExpenses = tripId ? expenses[tripId] || [] : [];
    const userId = user?.id || '';

    tripExpenses.forEach((expense) => {
      totalTrip += expense.amount;

      const percentageMap = expense.percentages || {};
      const userSharePercent = percentageMap[userId] || 0;
      const userShareAmount = (expense.amount * userSharePercent) / 100;

      if (expense.paid_by === userId) {
        totalSpent += expense.amount;

        // You paid, others owe you their shares
        const othersOwe = Object.entries(percentageMap)
          .filter(([id]) => id !== userId)
          .reduce(
            (sum, [, percent]) => sum + (expense.amount * percent) / 100,
            0
          );

        totalOwed -= othersOwe; // You're owed this much by others
      } else {
        // Someone else paid, you owe your share
        totalOwed += userShareAmount;
      }
    });

    return {
      totalOwed: totalOwed.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      totalTrip: totalTrip.toFixed(2),
    };
  };

  const { totalOwed, totalSpent, totalTrip } = calculateBalances();

  return (
    <div className="flex flex-col items-center justify-center space-y-w text-primary hover:text-primary/90 cursor-pointer transition-all">
      <p className="font-voyago">{selectedTrip?.tripname}</p>
      <div className="flex items-center space-x-2">
        <Coins
          className={`h-6 w-6 ${
            parseFloat(totalOwed) > 0
              ? 'text-red-500'
              : parseFloat(totalOwed) < 0
                ? 'text-green-500'
                : 'text-gray-700'
          }`}
        />
        <p
          className={`text-lg font-medium font-funneld font-voyago ${
            parseFloat(totalOwed) > 0
              ? 'text-red-500'
              : parseFloat(totalOwed) < 0
                ? 'text-green-500'
                : 'text-gray-700'
          }`}
        >
          {parseFloat(totalOwed) > 0
            ? `You owe ${totalOwed}`
            : parseFloat(totalOwed) < 0
              ? `People owe you ${Math.abs(parseFloat(totalOwed))}`
              : 'All settled'}
        </p>
      </div>
      <p className="text-xs">You Spent: {totalSpent}</p>
      <p className="text-xs">Trip cost: {totalTrip}</p>
    </div>
  );
};

export default TripExpensesCard;
