import React, { useState } from 'react';
import { Shield, Eye, EyeOff, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ResetPasswordErrors {
  newPassword?: string;
  confirmPassword?: string;
}

const ResetPasswordScreen: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [message, setMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: ResetPasswordErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hash) {
      setMessage('Hash de redefinição não encontrado na URL.');
      return;
    }

    setLoading(true);

    try {
      // Simular redefinição de senha
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccessMessage('Sua senha foi redefinida com sucesso! Você já pode fazer login com a nova senha.');
      setSuccess(true);
      setMessage('Senha redefinida com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao redefinir senha:', error);
      setMessage('Erro ao redefinir senha. Verifique se o link ainda é válido.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name as keyof ResetPasswordErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleGoToLogin = () => {
    navigate('/');
  };

  // Se não há hash na URL, mostrar erro
  if (!hash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Link Inválido</h2>
          <p className="text-gray-600 mb-6">
            O link de redefinição de senha é inválido ou expirou.
          </p>
          <button
            onClick={handleGoToLogin}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Ir para Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex-col justify-center items-center text-white">
        <div className="text-center">
          <div className="bg-white bg-opacity-20 p-6 rounded-full mb-6 backdrop-blur-sm">
            <Shield className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Portal do Visitante</h1>
          <p className="text-xl mb-8 text-blue-100">Redefinição de Senha</p>
          
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold mb-4">Segurança em Primeiro Lugar</h3>
            <ul className="text-sm text-blue-100 space-y-2 text-left">
              <li>• Crie uma senha forte e única</li>
              <li>• Use pelo menos 6 caracteres</li>
              <li>• Combine letras, números e símbolos</li>
              <li>• Não compartilhe sua senha</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Reset form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          {success ? (
            // Success state
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Senha Redefinida!</h2>
              <p className="text-gray-600 mb-8">
                {successMessage}
              </p>
              {message && (
                <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-700 text-sm">{message}</p>
                </div>
              )}
              <button
                onClick={handleGoToLogin}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Ir para Login</span>
              </button>
            </div>
          ) : (
            // Reset form
            <>
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Lock className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Redefinir Senha</h2>
                <p className="mt-2 text-gray-600">
                  Digite sua nova senha abaixo
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite sua nova senha (mín. 6 caracteres)"
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
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirme sua nova senha"
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
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Requisitos da senha:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${formData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Mínimo de 6 caracteres</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Senhas coincidem</span>
                    </li>
                  </ul>
                </div>

                {message && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{message}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Redefinindo...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Redefinir Senha</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoToLogin}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Voltar ao Login</span>
                  </button>
                </div>
              </form>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Dicas de Segurança:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Use uma combinação de letras maiúsculas e minúsculas</li>
                  <li>• Inclua números e símbolos especiais</li>
                  <li>• Evite informações pessoais óbvias</li>
                  <li>• Não reutilize senhas de outras contas</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;