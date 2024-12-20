import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
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

// Zod schema including trip name and selected country
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

export interface TripFormValues {
  tripname: string;
  country: string;
  daterange: {
    from: string;
    to: string;
  };
  id: string;
}

function TripForm({
  onTripUpdate,
  trip,
  isUpdated,
}: {
  onTripUpdate: () => void;
  trip?: TripFormValues;
  isUpdated?: boolean;
}) {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripname: trip?.tripname || '',
      country: trip?.country || '',
      daterange: {
        from: trip ? new Date(trip.daterange.from) : new Date(),
        to: trip ? new Date(trip.daterange.to) : addDays(new Date(), 10),
      },
    },
  });

  // Create trip handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      alert('You need to be signed in to create a trip!');
      return;
    }

    try {
      const { data, error } = await supabase.from('trips').insert({
        tripname: values.tripname,
        country: values.country,
        daterange: values.daterange,
        ownerid: user.id,
        imageurl: Math.floor(Math.random() * 7) + 1,
      });

      if (error) {
        console.error('Error saving trip:', error.message);
        alert('Error saving trip');
      } else {
        console.log('Trip saved successfully:', data);
        toast('Trip created successfully!');
        form.reset();
        onTripUpdate();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
    }
  };

  // Update trip handler
  const onUpdated = async (values: z.infer<typeof formSchema>) => {
    if (!trip) {
      toast('You need to be have created a trip to update a trip!');
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
        onTripUpdate();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast('An unexpected error occurred');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={
          isUpdated ? form.handleSubmit(onUpdated) : form.handleSubmit(onSubmit)
        }
        className="space-y-6"
      >
        {/* Trip Name Field */}
        <FormField
          control={form.control}
          name="tripname"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago tracking-tight">
                Trip Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter your trip name" {...field} />
              </FormControl>
              {!isUpdated && (
                <FormDescription>
                  Give your trip a meaningful name.
                </FormDescription>
              )}
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
              <FormLabel className="font-voyago tracking-tight">
                Country
              </FormLabel>
              <FormControl>
                {/* Use the CountriesDropdown component */}
                <CountriesDropdown
                  selected={field.value}
                  onSelect={(value) => field.onChange(value)}
                />
              </FormControl>
              {!isUpdated && (
                <FormDescription>
                  Select the main country for your trip.
                </FormDescription>
              )}
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
              <FormLabel className="font-voyago tracking-tight">
                Trip Date Range
              </FormLabel>
              <FormControl>
                <CalendarDateRangePicker
                  dateRange={field.value}
                  onChange={(range) => field.onChange(range)}
                />
              </FormControl>
              {!isUpdated && (
                <FormDescription>
                  Select the date range for your trip.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="rounded-md w-full">
          {isUpdated ? 'Update Trip' : 'Create Trip'}
        </Button>
      </form>
    </Form>
  );
}

export default TripForm;
