import React from 'react';
import { LogIn, LogOut, User } from 'lucide-react';

interface Action {
  id: number;
  name: string;
  action: string;
  created_at: string;
}

interface GateActionsProps {
  title: string;
  actions: Action[];
  isEntrance: boolean; // Define se é para "entrada" ou "saída"
}

const ActionGateView: React.FC<GateActionsProps> = ({ title, actions, isEntrance }) => {
  return (
    <div className="space-y12">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 space-y-4">
          <div className="flex items-center space-x-4">
            <div
              className={`bg-gradient-to-br ${
                isEntrance ? 'from-green-500 to-green-600' : 'from-gray-500 to-gray-600'
              } p-4 rounded-full shadow-lg`}
            >
              {isEntrance ? <LogIn className="w-4 h-4 text-white" /> : <LogOut className="w-4 h-4 text-white" />}
            </div>
          </div>

          <div className="space-y-3">
            {actions.map((action, index) => {
              const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(action.created_at));

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{action.name}</p>
                      <p className="text-sm text-gray-600">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionGateView;