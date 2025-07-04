import React, { useState } from 'react';
import { Building } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { phoneMasks, otherMasks } from '../../utils/masks';
import StatesCitiesSelector from '../common/StatesCitiesSelector';

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
  
  // Inicializar com valores corretos, convertendo para number quando necessário
  const [formData, setFormData] = useState({
    cnpj: company?.cnpj || '',
    razaoSocial: company?.razaoSocial || company?.corporate_name || '',
    nomeFantasia: company?.nomeFantasia || company?.fantasy_name || '',
    cep: company?.cep || '',
    logradouro: company?.logradouro || '',
    numero: company?.numero || '',
    complemento: company?.complemento || '',
    bairro: company?.bairro || '',
    cidadeId: company?.cidadeId || company?.city_id || 0,
    cidadeNome: company?.cidade || company?.city_name || '',
    estadoId: company?.estadoId || company?.state_id || 0,
    estadoNome: company?.estado || company?.state_name || '',
    estadoSigla: company?.estadoSigla || company?.state || '',
    email: company?.email || '',
    telefone: company?.telefone || company?.phone_number || '',
    celular: company?.celular || company?.mobile_number || ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  console.log('📝 CompanyForm - Dados iniciais:', formData);
  console.log('📝 CompanyForm - Company prop:', company);

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

    if (!formData.cidadeId || Number(formData.cidadeId) === 0) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!formData.estadoId || Number(formData.estadoId) === 0) {
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
      cnpj: otherMasks.cnpj(formData.cnpj).replace(/\D/g, ''),
      corporate_name: formData.razaoSocial,
      fantasy_name: formData.nomeFantasia,
      cep: otherMasks.cep(formData.cep).replace(/\D/g, ''),
      street: formData.logradouro,
      number: formData.numero,
      complement: formData.complemento,
      neighborhood: formData.bairro,
      city_id: Number(formData.cidadeId),
      city_name: formData.cidadeNome,
      state_id: Number(formData.estadoId),
      state: formData.estadoSigla,
      state_name: formData.estadoNome,
      email: formData.email,
      phone_number: phoneMasks.unmask(formData.telefone),
      mobile_number: phoneMasks.unmask(formData.celular)
    };

    console.log('📤 Enviando dados da empresa:', dataToSubmit);

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

  const handleStateChange = (stateId: number, stateName: string, stateAbbreviation: string) => {
    console.log(`🗺️ Estado alterado - ID: ${stateId}, Nome: ${stateName}, Sigla: ${stateAbbreviation}`);
    
    setFormData({
      ...formData,
      estadoId: stateId,
      estadoNome: stateName,
      estadoSigla: stateAbbreviation,
      cidadeId: 0, // Limpar cidade quando mudar estado
      cidadeNome: ''
    });

    // Limpar erro de estado
    if (errors.estado) {
      setErrors({
        ...errors,
        estado: undefined
      });
    }
  };

  const handleCityChange = (cityId: number, cityName: string) => {
    console.log(`🏙️ Cidade alterada - ID: ${cityId}, Nome: ${cityName}`);
    
    setFormData({
      ...formData,
      cidadeId: cityId,
      cidadeNome: cityName
    });

    // Limpar erro de cidade
    if (errors.cidade) {
      setErrors({
        ...errors,
        cidade: undefined
      });
    }
  };

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
              placeholder="Razão social da empresa"
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
            placeholder="Nome fantasia da empresa"
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
              placeholder="Rua, Avenida, etc."
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
              placeholder="123"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.numero ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.numero && (
              <p className="text-red-500 text-sm mt-1">{errors.numero}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complemento
            </label>
            <input
              type="text"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
              placeholder="Sala, Andar, etc."
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
              placeholder="Nome do bairro"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bairro ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.bairro && (
              <p className="text-red-500 text-sm mt-1">{errors.bairro}</p>
            )}
          </div>
        </div>

        {/* Seletor de Estado e Cidade */}
        <StatesCitiesSelector
          selectedStateId={formData.estadoId}
          selectedCityId={formData.cidadeId}
          onStateChange={handleStateChange}
          onCityChange={handleCityChange}
          stateError={errors.estado}
          cityError={errors.cidade}
          required={true}
        />

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
              placeholder="contato@empresa.com"
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