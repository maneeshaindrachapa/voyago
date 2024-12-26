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
import { toast } from 'sonner';
import { addDays } from 'date-fns';
import { addTripRequest, useTripContext } from '../context/TripContext';
import { Dispatch, SetStateAction } from 'react';

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
  trip,
  isUpdated,
  setClose,
}: {
  trip?: TripFormValues;
  isUpdated?: boolean;
  setClose?: Dispatch<SetStateAction<boolean>>;
}) {
  const { user } = useUser();
  const { addTrip, updateTrip } = useTripContext();

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
    const tripValues: addTripRequest = {
      tripname: values.tripname,
      country: values.country,
      daterange: values.daterange,
    };
    addTrip(tripValues);
    form.reset();
    setClose ? setClose(false) : '';
  };

  // Update trip handler
  const onUpdated = async (values: z.infer<typeof formSchema>) => {
    if (!trip) {
      toast('You need to be have created a trip to update a trip!');
      return;
    }
    const tripData = {
      tripid: trip.id,
      tripname: values.tripname,
      country: values.country,
      daterange: { from: values.daterange.from, to: values.daterange.to },
    };
    await updateTrip(tripData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={
          isUpdated ? form.handleSubmit(onUpdated) : form.handleSubmit(onSubmit)
        }
        className="space-y-6 mb-0 pb-0"
      >
        <FormField
          control={form.control}
          name="tripname"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago tracking-tighter">
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

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago tracking-tighter">
                Country
              </FormLabel>
              <FormControl>
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

        <FormField
          control={form.control}
          name="daterange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-voyago tracking-tighter">
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

        <Button type="submit" className="rounded-md w-full">
          {isUpdated ? 'Update Trip' : 'Create Trip'}
        </Button>
      </form>
    </Form>
  );
}

export default TripForm;
