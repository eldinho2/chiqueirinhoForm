'use client';

import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import LogTable from "@/app/components/historico/LogTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Header from "../components/Header";

export default function HistoricoPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["playersAllTimeData"],
    queryFn: async () => {
      const response = await fetch("/api/getAllTimeData");
      const data = await response.json();
      return data;
    },
    initialData: queryClient.getQueryData(["playersAllTimeData"]),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-[300px]" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dungeon log data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Dungeon Log</CardTitle>
          </CardHeader>
          <CardContent>
            <LogTable data={data} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}