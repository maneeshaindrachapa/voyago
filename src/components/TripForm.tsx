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

function TripForm() {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripname: '',
      country: '',
      daterange: {
        from: new Date(),
        to: addDays(new Date(), 10),
      },
    },
  });

  // Submit handler
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
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
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
              <FormLabel>Trip Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your trip name" {...field} />
              </FormControl>
              <FormDescription>
                Give your trip a meaningful name.
              </FormDescription>
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
              <FormLabel>Country</FormLabel>
              <FormControl>
                {/* Use the CountriesDropdown component */}
                <CountriesDropdown
                  selected={field.value}
                  onSelect={(value) => field.onChange(value)} // Update form state
                />
              </FormControl>
              <FormDescription>
                Select the main country for your trip.
              </FormDescription>
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
              <FormLabel>Trip Date Range</FormLabel>
              <FormControl>
                {/* Integrate CalendarDateRangePicker */}
                <CalendarDateRangePicker
                  {...field}
                  onChange={(date) => field.onChange(date)} // Update form state on change
                />
              </FormControl>
              <FormDescription>
                Select the date range for your trip.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="rounded-md w-full">
          Create Trip
        </Button>
      </form>
    </Form>
  );
}

export default TripForm;
