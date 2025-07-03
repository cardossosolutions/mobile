import React, { useState } from 'react';
import { User, Lock, Mail, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileFormProps {
  onClose: () => void;
}

interface ProfileErrors {
  name?: string;
  email?: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validateProfile = (): boolean => {
    const newErrors: ProfileErrors = {};

    if (!profileData.name) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!profileData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: PasswordErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });

    // Clear error when user starts typing
    if (profileErrors[name as keyof ProfileErrors]) {
      setProfileErrors({
        ...profileErrors,
        [name]: undefined
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });

    // Clear error when user starts typing
    if (passwordErrors[name as keyof PasswordErrors]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: undefined
      });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!validateProfile()) {
      return;
    }

    setLoading(true);

    try {
      await updateUserProfile(profileData);
      setMessage('Perfil atualizado com sucesso!');
    } catch (error) {
      setMessage('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      // Mock password update - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Senha alterada com sucesso!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage('Erro ao alterar senha. Verifique a senha atual.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Dados Pessoais</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Alterar Senha</span>
            </div>
          </button>
        </nav>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('sucesso') 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  profileErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {profileErrors.name && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    profileErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {profileErrors.email && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <select
                name="department"
                value={profileData.department}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o departamento</option>
                <option value="Administração">Administração</option>
                <option value="Portaria">Portaria</option>
                <option value="Segurança">Segurança</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Limpeza">Limpeza</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              name="position"
              value={profileData.position}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Administrador, Porteiro, Supervisor"
            />
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha Atual <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                  passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                  passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite a nova senha (mín. 6 caracteres)"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nova Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                  passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirme a nova senha"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Requisitos da senha:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Mínimo de 6 caracteres</li>
              <li>• Recomendado: use letras maiúsculas, minúsculas e números</li>
              <li>• Evite senhas muito simples ou previsíveis</li>
            </ul>
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Alterando...' : 'Alterar Senha'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfileForm;