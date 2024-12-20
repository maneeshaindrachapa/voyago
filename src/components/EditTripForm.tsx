import React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { CountriesDropdown } from './CountriesDropdown';
import { CalendarDateRangePicker } from './DatePicker';
import { useUser } from '@clerk/clerk-react';
import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import { toast } from 'sonner';
import { addDays } from 'date-fns';

export interface TripFormValues {
  tripname: string;
  country: string;
  daterange: {
    from: string;
    to: string;
  };
  id: string;
}

function EditTripForm({ trip }: { trip: TripFormValues }) {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();

  const formSchema = z.object({
    tripname: z
      .string()
      .min(2, 'Trip name must be at least 2 characters')
      .max(50, 'Trip name must not exceed 50 characters'),
    country: z.string().min(1, 'Please select a country'),
    daterange: z
      .object({
        from: z.date(),
        to: z.date(),
      })
      .refine((range) => range.from <= range.to, {
        message: 'Please select a valid date range',
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripname: trip.tripname || '',
      country: trip.country || '',
      daterange: {
        from: new Date(trip.daterange?.from) || new Date(),
        to: new Date(trip.daterange?.to) || addDays(new Date(), 10),
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast('You need to be signed in to update a trip!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .update({
          tripname: values.tripname,
          country: values.country,
          daterange: values.daterange,
        })
        .eq('id', trip.id);

      if (error) {
        console.error('Error updating trip:', error.message);
        toast('Error updating trip. Please try again.');
      } else {
        toast('Trip updated successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast('An unexpected error occurred');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Trip Name Field */}
        <FormField
          control={form.control}
          name="tripname"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago">Trip Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your trip name"
                  {...field}
                  autoFocus={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country Selection Field */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago">Country</FormLabel>
              <FormControl>
                <CountriesDropdown
                  selected={field.value}
                  onSelect={(value) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Range Picker Field */}
        <FormField
          control={form.control}
          name="daterange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago">Trip Date Range</FormLabel>
              <FormControl>
                {/* Integrate CalendarDateRangePicker */}
                <CalendarDateRangePicker
                  {...field}
                  from={new Date(trip.daterange.from)}
                  to={new Date(trip.daterange.to)}
                  onChange={(date) => field.onChange(date)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="rounded-md w-full">
          Update Trip
        </Button>
      </form>
    </Form>
  );
}

export default EditTripForm;
