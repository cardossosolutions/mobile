import React, { useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useStatesAndCities } from '../../hooks/useStatesAndCities';

interface StatesCitiesSelectorProps {
  selectedStateId: number | string;
  selectedCityId: number | string;
  onStateChange: (stateId: number, stateName: string, stateAbbreviation: string) => void;
  onCityChange: (cityId: number, cityName: string) => void;
  stateError?: string;
  cityError?: string;
  disabled?: boolean;
  required?: boolean;
}

const StatesCitiesSelector: React.FC<StatesCitiesSelectorProps> = ({
  selectedStateId,
  selectedCityId,
  onStateChange,
  onCityChange,
  stateError,
  cityError,
  disabled = false,
  required = false
}) => {
  const {
    states,
    cities,
    loadingStates,
    loadingCities,
    statesError,
    citiesError,
    loadCities,
    clearCities
  } = useStatesAndCities();

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    const stateIdNumber = Number(selectedStateId);
    if (selectedStateId && stateIdNumber > 0) {
      console.log(`🏙️ Carregando cidades para o estado ID: ${stateIdNumber}`);
      loadCities(stateIdNumber);
    } else {
      clearCities();
    }
  }, [selectedStateId]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log(`🗺️ Valor selecionado no select: "${value}"`);
    
    // Se valor vazio, limpar seleção
    if (!value || value === '' || value === '0') {
      console.log('🔄 Limpando seleção de estado');
      onStateChange(0, '', '');
      onCityChange(0, '');
      return;
    }
    
    const stateId = Number(value);
    console.log(`🗺️ Estado ID convertido: ${stateId}`);
    
    if (stateId > 0) {
      const selectedState = states.find(state => state.id === stateId);
      if (selectedState) {
        console.log(`✅ Estado encontrado:`, selectedState);
        onStateChange(stateId, selectedState.name, selectedState.sigla);
        // Limpar cidade selecionada quando mudar o estado
        onCityChange(0, '');
      } else {
        console.error(`❌ Estado com ID ${stateId} não encontrado na lista`);
      }
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log(`🏙️ Valor selecionado no select de cidade: "${value}"`);
    
    // Se valor vazio, limpar seleção
    if (!value || value === '' || value === '0') {
      console.log('🔄 Limpando seleção de cidade');
      onCityChange(0, '');
      return;
    }
    
    const cityId = Number(value);
    console.log(`🏙️ Cidade ID convertido: ${cityId}`);
    
    if (cityId > 0) {
      const selectedCity = cities.find(city => city.id === cityId);
      if (selectedCity) {
        console.log(`✅ Cidade encontrada:`, selectedCity);
        onCityChange(cityId, selectedCity.name);
      } else {
        console.error(`❌ Cidade com ID ${cityId} não encontrada na lista`);
      }
    }
  };

  // Garantir que os valores sejam strings válidas para o select
  const stateValue = selectedStateId && Number(selectedStateId) > 0 ? String(selectedStateId) : '';
  const cityValue = selectedCityId && Number(selectedCityId) > 0 ? String(selectedCityId) : '';

  console.log(`🔍 StatesCitiesSelector - Estado: ${selectedStateId} -> "${stateValue}", Cidade: ${selectedCityId} -> "${cityValue}"`);
  console.log(`📋 Estados disponíveis:`, states.map(s => ({ id: s.id, name: s.name })));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Estado {required && <span className="text-red-500">*</span>}</span>
          </div>
        </label>
        <div className="relative">
          <select
            value={stateValue}
            onChange={handleStateChange}
            disabled={disabled || loadingStates}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              stateError || statesError ? 'border-red-500' : 'border-gray-300'
            } ${disabled || loadingStates ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {loadingStates ? 'Carregando estados...' : 'Selecione o estado'}
            </option>
            {states.map(state => (
              <option key={state.id} value={String(state.id)}>
                {state.sigla} - {state.name}
              </option>
            ))}
          </select>
          
          {loadingStates && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        
        {(stateError || statesError) && (
          <p className="text-red-500 text-sm mt-1">{stateError || statesError}</p>
        )}
        
        {statesError && (
          <p className="text-yellow-600 text-xs mt-1">
            ⚠️ Usando lista padrão de estados brasileiros
          </p>
        )}
        
        {/* Debug info - remover em produção */}
        <div className="text-xs text-gray-400 mt-1">
          Debug: selectedStateId={selectedStateId}, stateValue="{stateValue}", states.length={states.length}
        </div>
      </div>

      {/* Cidade */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Cidade {required && <span className="text-red-500">*</span>}</span>
          </div>
        </label>
        <div className="relative">
          <select
            value={cityValue}
            onChange={handleCityChange}
            disabled={disabled || loadingCities || !selectedStateId || Number(selectedStateId) === 0}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              cityError || citiesError ? 'border-red-500' : 'border-gray-300'
            } ${disabled || loadingCities || !selectedStateId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {!selectedStateId || Number(selectedStateId) === 0
                ? 'Selecione um estado primeiro'
                : loadingCities
                ? 'Carregando cidades...'
                : cities.length === 0
                ? 'Nenhuma cidade encontrada'
                : 'Selecione a cidade'
              }
            </option>
            {cities.map(city => (
              <option key={city.id} value={String(city.id)}>
                {city.name}
              </option>
            ))}
          </select>
          
          {loadingCities && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        
        {(cityError || citiesError) && (
          <p className="text-red-500 text-sm mt-1">{cityError || citiesError}</p>
        )}
        
        {!selectedStateId && (
          <p className="text-gray-500 text-xs mt-1">Selecione um estado para ver as cidades</p>
        )}
        
        {selectedStateId && cities.length === 0 && !loadingCities && !citiesError && (
          <p className="text-yellow-600 text-xs mt-1">
            ⚠️ Nenhuma cidade encontrada para este estado
          </p>
        )}
        
        {/* Debug info - remover em produção */}
        <div className="text-xs text-gray-400 mt-1">
          Debug: selectedCityId={selectedCityId}, cityValue="{cityValue}", cities.length={cities.length}
        </div>
      </div>
    </div>
  );
};

export default StatesCitiesSelector;