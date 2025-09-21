import { AiFormValidatorForm } from "@/components/forms/ai-form-validator-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from 'lucide-react';

export default function AiFormValidatorPage() {
    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <BrainCircuit className="h-10 w-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-headline">AI-Powered Form Validator</CardTitle>
                            <CardDescription>
                                Paste a JSON form configuration below to get AI-powered suggestions for improving user experience, accessibility, and more.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <AiFormValidatorForm />
                </CardContent>
            </Card>
        </div>
    );
}
