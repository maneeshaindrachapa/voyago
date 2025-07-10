import React, { useRef } from 'react';
import { useExpenseContext } from '../context/ExpensesContext';
import { useTripContext } from '../context/TripContext';
import { Avatar, AvatarImage } from './ui/avatar';
import { useUserContext } from '../context/UserContext';
import {
  Bed,
  Coffee,
  Plane,
  Printer,
  ShoppingBag,
  Utensils,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useReactToPrint } from 'react-to-print';
import { Skeleton } from './ui/skeleton';

const expenseTypes = {
  FOOD: { label: 'Food & Drinks', icon: <Utensils className="w-4 h-4 mr-2" /> },
  TRAVEL: { label: 'Travel', icon: <Plane className="w-4 h-4 mr-2" /> },
  ACCOMMODATION: {
    label: 'Accommodation',
    icon: <Bed className="w-4 h-4 mr-2" />,
  },
  SHOPPING: {
    label: 'Shopping',
    icon: <ShoppingBag className="w-4 h-4 mr-2" />,
  },
  MISC: { label: 'Miscellaneous', icon: <Coffee className="w-4 h-4 mr-2" /> },
};

const TripExpensesDetails: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const { selectedTrip } = useTripContext();
  const { expenses, loading } = useExpenseContext();
  const { users } = useUserContext();
  const { user } = useUser();

  if (loading)
    return (
      <div className="flex flex-col space-y-3 p-2 w-full">
        <Skeleton className="h-[10vh] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-[10vh] w-full rounded-xl" />
      </div>
    );

  const tripId = selectedTrip?.id;
  const tripExpenses = tripId ? expenses[tripId] || [] : [];

  const findUser = (userId: string) =>
    users?.find((user) => user.id === userId) || {
      firstName: 'Unknown',
      imageUrl: '',
    };

  const capitalizeFirstLetter = (name: string | null) => {
    if (name) return name.charAt(0).toUpperCase() + name.slice(1);
  };
  const getExpenseIcon = (expenseType: keyof typeof expenseTypes) => {
    return expenseTypes[expenseType]?.icon || null;
  };

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
    <div>
      <div
        className="p-4 rounded-lg shadow-lg max-h-[80vh] overflow-y-scroll"
        ref={contentRef}
      >
        <h2 className="text-lg font-bold mb-1">
          {selectedTrip?.tripname || 'No trip selected'}
        </h2>

        {tripExpenses.length === 0 ? (
          <p>No expenses recorded for this trip.</p>
        ) : (
          <ul className="space-y-4">
            {tripExpenses.map((expense) => {
              const paidByUser = findUser(expense.paid_by);
              return (
                <li key={expense.id} className="p-4 border-b">
                  <h3 className="text-md font-semibold">
                    {capitalizeFirstLetter(expense.name)}
                  </h3>
                  <div className="flex flex-row justify-between items-center gap-y-2">
                    <div>
                      <p className="text-xs flex flex-row mb-1">
                        {getExpenseIcon(
                          expense.expense_type as keyof typeof expenseTypes
                        )}
                        <span className="font-voyago">
                          {capitalizeFirstLetter(
                            expense.expense_type.toLowerCase()
                          )}
                        </span>
                      </p>
                      <p className="text-xs">
                        Amount:{' '}
                        <span className="font-voyago">
                          {expense.amount.toFixed(2)}
                        </span>
                      </p>
                      <p className="text-xs ">
                        Date:{' '}
                        <span className="text-xs font-voyago">
                          {new Date(expense.created_at).toLocaleDateString()}
                        </span>
                      </p>
                      <p className="text-xs font-voyago mt-2">
                        Split Between
                        <ul className="list-disc flex flex-row items-start">
                          {expense.split_between.map((userId, index) => {
                            const splitUser = findUser(userId);
                            return (
                              <li key={index} className="flex items-center">
                                <Avatar className="w-6 h-6 mr-1">
                                  <AvatarImage
                                    src={splitUser.imageUrl || ''}
                                    alt={splitUser.firstName || ''}
                                  />
                                </Avatar>
                                {/* <span>
                              {capitalizeFirstLetter(splitUser.firstName)}
                            </span> */}
                              </li>
                            );
                          })}
                        </ul>
                      </p>
                    </div>

                    <div>
                      <p className="text-xs flex flex-row justify-between items-center font-voyago">
                        Paid By
                        <span className="flex items-center ml-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={paidByUser.imageUrl || ''}
                              alt={paidByUser.firstName || ''}
                            />
                          </Avatar>
                        </span>
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {tripExpenses.length > 0 && (
          <>
            <p className="text-sm mt-2 flex justify-end">
              You Spent: {totalSpent}
            </p>
            <p className="text-sm  mt -2 flex justify-end">
              Total Trip Cost: {totalTrip}
            </p>
            <p
              className={`text-sm mt-3 font-voyago flex justify-end ${
                parseFloat(totalOwed) > 0
                  ? 'text-red-500'
                  : parseFloat(totalOwed) < 0
                    ? 'text-green-500'
                    : 'text-gray-700'
              }`}
            >
              {parseFloat(totalOwed) > 0
                ? `You owe: ${totalOwed}`
                : parseFloat(totalOwed) < 0
                  ? `People owe you: ${Math.abs(parseFloat(totalOwed))}`
                  : 'All settled'}
            </p>
          </>
        )}
      </div>
      <button
        onClick={() => reactToPrintFn()}
        className="mt-4 bg-muted p-2 hover:bg-muted/50 px-4 py-2 rounded shadow flex flex-row text-sm float-end"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Expenses
      </button>
    </div>
  );
};

export default TripExpensesDetails;
