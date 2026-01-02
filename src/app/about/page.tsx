"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="p-6 flex justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>
            Shadcn/ui is successfully installed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This page demonstrates a Shadcn Card and Button component.
          </p>

          <Button onClick={() => console.log("clicked")}>Click me</Button>
        </CardContent>
      </Card>
    </main>
  );
}
