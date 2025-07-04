import React, { useState } from 'react';
import { Users, Search, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface EmployeeFormProps {
  employee?: any;
  onClose: () => void;
}

interface FormErrors {
  nome?: string;
  email?: string;
  companyId?: string;
  permissao?: string;
  status?: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose }) => {
  const { addEmployee, updateEmployee, companies } = useData();
  const [formData, setFormData] = useState({
    nome: employee?.nome || '',
    email: employee?.email || '',
    companyId: employee?.companyId || '',
    permissao: employee?.permissao || '',
    status: employee?.status || 'Ativo'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Estados para pesquisa de empresa
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  
  // Estados para pesquisa de permissão
  const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
  const [showPermissionDropdown, setShowPermissionDropdown] = useState(false);

  const permissionOptions = ['Administrador', 'Operador', 'Visitante'];
  const statusOptions = ['Ativo', 'Inativo', 'Suspenso'];

  // Filtrar empresas baseado na pesquisa
  const filteredCompanies = companies.filter(company =>
    company.fantasy_name?.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
    company.corporate_name?.toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  // Filtrar permissões baseado na pesquisa
  const filteredPermissions = permissionOptions.filter(permission =>
    permission.toLowerCase().includes(permissionSearchTerm.toLowerCase())
  );

  // Obter nome da empresa selecionada
  const selectedCompanyName = companies.find(company => company.id === formData.companyId)?.fantasy_name || '';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Empresa é obrigatória';
    }

    if (!formData.permissao) {
      newErrors.permissao = 'Permissão é obrigatória';
    }

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (employee) {
      updateEmployee(employee.id, formData);
    } else {
      addEmployee(formData);
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleCompanySelect = (company: any) => {
    setFormData({
      ...formData,
      companyId: company.id
    });
    setCompanySearchTerm('');
    setShowCompanyDropdown(false);
    
    // Clear error
    if (errors.companyId) {
      setErrors({
        ...errors,
        companyId: undefined
      });
    }
  };

  const handlePermissionSelect = (permission: string) => {
    setFormData({
      ...formData,
      permissao: permission
    });
    setPermissionSearchTerm('');
    setShowPermissionDropdown(false);
    
    // Clear error
    if (errors.permissao) {
      setErrors({
        ...errors,
        permissao: undefined
      });
    }
  };

  const clearCompanySelection = () => {
    setFormData({
      ...formData,
      companyId: ''
    });
    setCompanySearchTerm('');
    setShowCompanyDropdown(false);
  };

  const clearPermissionSelection = () => {
    setFormData({
      ...formData,
      permissao: ''
    });
    setPermissionSearchTerm('');
    setShowPermissionDropdown(false);
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {employee ? 'Editar Funcionário' : 'Novo Funcionário'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome completo do funcionário"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.nome ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nome && (
            <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@empresa.com"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Empresa com Pesquisa */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa <span className="text-red-500">*</span>
          </label>
          
          <div className="relative">
            <div
              className={`w-full px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer ${
                errors.companyId ? 'border-red-500' : 'border-gray-300'
              } bg-white`}
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            >
              <div className="flex items-center justify-between">
                <span className={selectedCompanyName ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedCompanyName || 'Selecione a empresa'}
                </span>
                <div className="flex items-center space-x-2">
                  {selectedCompanyName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearCompanySelection();
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Dropdown de Empresas */}
            {showCompanyDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Pesquisar empresa..."
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(company => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleCompanySelect(company)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      >
                        <div>
                          <div className="font-medium">{company.fantasy_name}</div>
                          <div className="text-sm text-gray-500">{company.corporate_name}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      Nenhuma empresa encontrada
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {errors.companyId && (
            <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Permissão com Pesquisa */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permissão <span className="text-red-500">*</span>
            </label>
            
            <div className="relative">
              <div
                className={`w-full px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer ${
                  errors.permissao ? 'border-red-500' : 'border-gray-300'
                } bg-white`}
                onClick={() => setShowPermissionDropdown(!showPermissionDropdown)}
              >
                <div className="flex items-center justify-between">
                  <span className={formData.permissao ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.permissao || 'Selecione a permissão'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {formData.permissao && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearPermissionSelection();
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Dropdown de Permissões */}
              {showPermissionDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Pesquisar permissão..."
                        value={permissionSearchTerm}
                        onChange={(e) => setPermissionSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {filteredPermissions.length > 0 ? (
                      filteredPermissions.map(permission => (
                        <button
                          key={permission}
                          type="button"
                          onClick={() => handlePermissionSelect(permission)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                        >
                          {permission}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        Nenhuma permissão encontrada
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {errors.permissao && (
              <p className="text-red-500 text-sm mt-1">{errors.permissao}</p>
            )}
          </div>

          {/* Status (select normal) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {employee ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>

      {/* Overlay para fechar dropdowns */}
      {(showCompanyDropdown || showPermissionDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCompanyDropdown(false);
            setShowPermissionDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeForm;