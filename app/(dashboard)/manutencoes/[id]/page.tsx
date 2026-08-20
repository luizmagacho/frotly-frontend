import { Wrench } from 'lucide-react';
import Link from 'next/link';

export default function PlaceholderPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
        <Wrench className="h-10 w-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Em Desenvolvimento</h1>
      <p className="max-w-md text-slate-500 dark:text-slate-400">
        Esta tela ainda está sendo construída e estará disponível em breve.
      </p>
      <Link href="/dashboard" className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Voltar ao Início
      </Link>
    </div>
  );
}
