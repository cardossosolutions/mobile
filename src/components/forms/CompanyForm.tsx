import React, { useState } from 'react';
import { Building } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { phoneMasks, otherMasks } from '../../utils/masks';

interface CompanyFormProps {
  company?: any;
  onClose: () => void;
}

interface FormErrors {
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  email?: string;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onClose }) => {
  const { addCompany, updateCompany } = useData();
  const [formData, setFormData] = useState({
    cnpj: company?.cnpj || '',
    razaoSocial: company?.razaoSocial || company?.corporate_name || '',
    nomeFantasia: company?.nomeFantasia || company?.fantasy_name || '',
    cep: company?.cep || '',
    logradouro: company?.logradouro || '',
    numero: company?.numero || '',
    complemento: company?.complemento || '',
    bairro: company?.bairro || '',
    cidade: company?.cidade || company?.city_name || '',
    estado: company?.estado || company?.state || '',
    email: company?.email || '',
    telefone: company?.telefone || company?.phone_number || '',
    celular: company?.celular || company?.mobile_number || ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.cnpj) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    }

    if (!formData.razaoSocial) {
      newErrors.razaoSocial = 'Razão Social é obrigatória';
    }

    if (!formData.nomeFantasia) {
      newErrors.nomeFantasia = 'Nome Fantasia é obrigatório';
    }

    if (!formData.cep) {
      newErrors.cep = 'CEP é obrigatório';
    }

    if (!formData.logradouro) {
      newErrors.logradouro = 'Logradouro é obrigatório';
    }

    if (!formData.numero) {
      newErrors.numero = 'Número é obrigatório';
    }

    if (!formData.bairro) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    if (!formData.cidade) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!formData.estado) {
      newErrors.estado = 'Estado é obrigatório';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Remover máscaras antes de enviar
    const dataToSubmit = {
      ...formData,
      cnpj: otherMasks.cnpj(formData.cnpj).replace(/\D/g, ''),
      cep: otherMasks.cep(formData.cep).replace(/\D/g, ''),
      telefone: phoneMasks.unmask(formData.telefone),
      celular: phoneMasks.unmask(formData.celular)
    };

    if (company) {
      updateCompany(company.id, dataToSubmit);
    } else {
      addCompany(dataToSubmit);
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    // Aplicar máscaras específicas
    switch (name) {
      case 'cnpj':
        maskedValue = otherMasks.cnpj(value);
        break;
      case 'cep':
        maskedValue = otherMasks.cep(value);
        break;
      case 'telefone':
        maskedValue = phoneMasks.landline(value);
        break;
      case 'celular':
        maskedValue = phoneMasks.mobile(value);
        break;
      default:
        maskedValue = value;
    }

    setFormData({
      ...formData,
      [name]: maskedValue
    });

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <Building className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {company ? 'Editar Empresa' : 'Nova Empresa'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              placeholder="12.345.678/0001-90"
              maxLength={18}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cnpj ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cnpj && (
              <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razão Social <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.razaoSocial ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.razaoSocial && (
              <p className="text-red-500 text-sm mt-1">{errors.razaoSocial}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Fantasia <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nomeFantasia"
            value={formData.nomeFantasia}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.nomeFantasia ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nomeFantasia && (
            <p className="text-red-500 text-sm mt-1">{errors.nomeFantasia}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              placeholder="12345-678"
              maxLength={9}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cep ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cep && (
              <p className="text-red-500 text-sm mt-1">{errors.cep}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logradouro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="logradouro"
              value={formData.logradouro}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.logradouro ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.logradouro && (
              <p className="text-red-500 text-sm mt-1">{errors.logradouro}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.numero ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.numero && (
              <p className="text-red-500 text-sm mt-1">{errors.numero}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complemento
            </label>
            <input
              type="text"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bairro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bairro ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.bairro && (
              <p className="text-red-500 text-sm mt-1">{errors.bairro}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cidade ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cidade && (
              <p className="text-red-500 text-sm mt-1">{errors.cidade}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.estado ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione o estado</option>
            {estados.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
          {errors.estado && (
            <p className="text-red-500 text-sm mt-1">{errors.estado}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 3333-4444"
              maxLength={14}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Telefone fixo</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Celular
            </label>
            <input
              type="text"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              maxLength={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Telefone celular</p>
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
            {company ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;