import { Link } from "wouter";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Coffee className="w-20 h-20 text-[hsl(var(--starbucks-green))] mb-4" />
      <h1 className="text-4xl font-bold text-[hsl(var(--starbucks-green))] mb-2">404</h1>
      <p className="text-xl text-[hsl(var(--starbucks-gray))] mb-6">Page not found</p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
