import { Button } from '@components/ui/button';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Sift</h1>
      <p className="text-[var(--color-muted-foreground)] mb-8">
        Daily Reflection Tool
      </p>
      <div className="flex gap-4">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </div>
  );
}

export default App;
