import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Clock, DollarSign, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VisaCheckerProps {
  destination: string;
}

export const VisaChecker = ({ destination }: VisaCheckerProps) => {
  const [nationality, setNationality] = useState<string>("India");
  const [visaInfo, setVisaInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!nationality) {
      toast({
        title: "Missing Information",
        description: "Please enter your nationality",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('visa-checker', {
        body: {
          nationality,
          destination,
        },
      });

      if (error) throw error;
      setVisaInfo(data);
    } catch (error) {
      console.error('Visa check error:', error);
      toast({
        title: "Check Failed",
        description: "Unable to fetch visa information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVisaStatusColor = (status: string) => {
    if (status.toLowerCase().includes('free')) return 'bg-green-500';
    if (status.toLowerCase().includes('arrival')) return 'bg-blue-500';
    if (status.toLowerCase().includes('evisa')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visa Requirements</CardTitle>
        <CardDescription>Check visa requirements for your nationality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nationality">Your Nationality</Label>
          <Input
            id="nationality"
            placeholder="e.g., India, United States, United Kingdom"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
        </div>

        <Button onClick={handleCheck} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Check Visa Requirements
            </>
          )}
        </Button>

        {visaInfo && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <Badge className={getVisaStatusColor(visaInfo.visaRequired)}>
                {visaInfo.visaRequired}
              </Badge>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-semibold">Processing Time</div>
                  <div className="text-sm text-muted-foreground">{visaInfo.processingTime}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-semibold">Validity Period</div>
                  <div className="text-sm text-muted-foreground">{visaInfo.validityPeriod}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-semibold">Estimated Cost</div>
                  <div className="text-sm text-muted-foreground">{visaInfo.estimatedCost}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold mb-2">Required Documents</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {visaInfo.requiredDocuments.map((doc: string, idx: number) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold mb-2">Application Process</div>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    {visaInfo.applicationProcess.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {visaInfo.importantNotes && visaInfo.importantNotes.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Important Notes
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {visaInfo.importantNotes.map((note: string, idx: number) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {visaInfo.officialWebsite && (
                <Button variant="outline" asChild className="w-full">
                  <a href={visaInfo.officialWebsite} target="_blank" rel="noopener noreferrer">
                    Visit Official Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
