import Minesweeper from "./components/Minesweeper";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center py-8">
      <Minesweeper />
    </main>
  );
}
