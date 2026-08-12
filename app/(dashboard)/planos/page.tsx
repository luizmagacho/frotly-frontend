import { CreditCard } from 'lucide-react';

export default function PlanosPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
        <CreditCard className="h-10 w-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Planos de Assinatura</h1>
      <p className="max-w-md text-slate-500">
        Este módulo está em desenvolvimento. Em breve você poderá gerenciar os planos de assinatura do Frotly por aqui.
      </p>
    </div>
  );
}
