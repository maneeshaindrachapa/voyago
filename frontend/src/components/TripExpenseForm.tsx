import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTripContext } from '../context/TripContext';
import { useUserContext } from '../context/UserContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Coffee, Bed, Plane, ShoppingBag, Utensils } from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';
import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import { addExpenseToSupabase } from '../lib/expenses-serivce';
import { useExpenseContext } from '../context/ExpensesContext';

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

const expenseSchema = z.object({
  name: z.string().min(1, 'Expense name is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  expenseType: z.enum([
    'FOOD',
    'TRAVEL',
    'ACCOMMODATION',
    'SHOPPING',
    'MISC',
  ] as const),
  paidBy: z.string().min(1, 'Please select who paid'),
  splitBetween: z.array(z.string()).nonempty('Select at least one participant'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const TripExpenseForm: React.FC<{
  closeForm: Dispatch<SetStateAction<boolean>>;
}> = ({ closeForm }) => {
  const { selectedTrip } = useTripContext();
  const { users } = useUserContext();
  const [participants, setParticipants] = useState<
    { id: string; name: string; imageUrl: string }[]
  >([]);
  const { handleRefresh } = useExpenseContext();

  const supabase = createClerkSupabaseClient();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      amount: 0,
      expenseType: 'FOOD',
      paidBy: '',
      splitBetween: [],
    },
  });

  useEffect(() => {
    if (selectedTrip) {
      const sharedUsers = [
        ...(selectedTrip.sharedusers || []),
        { userId: selectedTrip.ownerid },
      ];
      const filteredUsers = users?.filter((u) =>
        sharedUsers.some((su) => su.userId === u.id)
      );
      console.log(filteredUsers);

      const participantsList = filteredUsers?.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName || ''}`.trim(),
        imageUrl: u.imageUrl || '',
      }));

      setParticipants(participantsList || []);
    }
  }, [selectedTrip, users]);

  const onSubmit = async (data: ExpenseFormValues) => {
    if (!selectedTrip) {
      console.error('No trip selected!');
      return;
    }

    const expenseData = {
      trip_id: selectedTrip.id,
      name: data.name,
      amount: data.amount,
      expense_type: data.expenseType,
      paid_by: data.paidBy,
      split_between: data.splitBetween,
    };

    await addExpenseToSupabase(supabase, expenseData);

    form.reset();
    handleRefresh();
    closeForm(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago">Expense Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter expense name" {...field} />
              </FormControl>
              <FormDescription>Add the expense</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago">Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>Amount you used up</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expenseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago">Expense Type</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expense type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(expenseTypes).map(
                      ([key, { label, icon }]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center">
                            {icon}
                            {label}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Select the type of expense</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paidBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago">Paid By</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const currentSplit = form.getValues('splitBetween') || [];
                    const previousPaidBy = field.value;
                    const updatedSplit = currentSplit.filter(
                      (id: string) => id !== previousPaidBy
                    );
                    const newSplit = [...updatedSplit, value];
                    form.setValue(
                      'splitBetween',
                      newSplit.length > 0
                        ? (newSplit as [string, ...string[]])
                        : [value]
                    );
                    field.onChange(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                  <SelectContent className="">
                    {participants.map((participant) => (
                      <SelectItem
                        key={participant.id}
                        value={participant.id}
                        className="flex items-center justify-between space-x-2"
                      >
                        <div className="flex items-center">
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarImage
                              src={participant?.imageUrl}
                              alt={participant.name}
                            />
                          </Avatar>
                          <p className="text-sm">{participant.name}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Select who paid the expense</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="splitBetween"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago">Split Between</FormLabel>
              <FormControl>
                <div className="space-y-2 max-h-[20vh] overflow-y-auto">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        checked={field.value.includes(participant.id)}
                        disabled={form.getValues('paidBy') === participant.id}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, participant.id]);
                          } else {
                            field.onChange(
                              field.value.filter((id) => id !== participant.id)
                            );
                          }
                        }}
                      />
                      <div className="flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarImage
                            src={participant?.imageUrl}
                            alt={participant.name}
                          />
                        </Avatar>
                        <p className="text-sm">{participant.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormDescription>
                Who or with whom you want to split the expense
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Add Expense
        </Button>
      </form>
    </Form>
  );
};

export default TripExpenseForm;
