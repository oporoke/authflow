'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { aiFormValidation } from '@/ai/flows/ai-form-validation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const exampleJson = {
    "fields": [
        {
            "name": "fname",
            "label": "First Name",
            "type": "text"
        },
        {
            "name": "emailaddress",
            "label": "Email",
            "type": "text"
        },
        {
            "name": "dob",
            "label": "Date of Birth",
            "type": "text",
            "placeholder": "MM/DD/YYYY"
        }
    ]
};

const FormValidatorSchema = z.object({
  formConfiguration: z.string().min(1, 'JSON configuration cannot be empty.')
    .refine((val) => {
        try {
            JSON.parse(val);
            return true;
        } catch (e) {
            return false;
        }
    }, { message: 'Invalid JSON format.' }),
});

export function AiFormValidatorForm() {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string>('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormValidatorSchema>>({
    resolver: zodResolver(FormValidatorSchema),
    defaultValues: {
      formConfiguration: JSON.stringify(exampleJson, null, 2),
    },
  });

  const onSubmit = (values: z.infer<typeof FormValidatorSchema>) => {
    setSuggestions('');
    startTransition(async () => {
      try {
        const result = await aiFormValidation({
          formConfiguration: values.formConfiguration,
        });
        setSuggestions(result.suggestions);
        toast({
            title: 'Analysis Complete',
            description: 'Suggestions have been generated below.',
        })
      } catch (error) {
        console.error('AI validation error:', error);
        toast({
            title: 'Error',
            description: 'Failed to get suggestions from the AI model.',
            variant: 'destructive',
        })
      }
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="formConfiguration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form JSON Configuration</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{ "fields": [...] }'
                      className="min-h-[200px] font-mono text-sm"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Analyze Form
          </Button>
        </form>
      </Form>

      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {suggestions}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
