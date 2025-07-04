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
    if (selectedStateId && Number(selectedStateId) > 0) {
      loadCities(Number(selectedStateId));
    } else {
      clearCities();
    }
  }, [selectedStateId]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = Number(e.target.value);
    
    if (stateId > 0) {
      const selectedState = states.find(state => state.id === stateId);
      if (selectedState) {
        onStateChange(stateId, selectedState.name, selectedState.sigla);
      }
    } else {
      onStateChange(0, '', '');
    }
    
    // Limpar cidade selecionada quando mudar o estado
    onCityChange(0, '');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = Number(e.target.value);
    
    if (cityId > 0) {
      const selectedCity = cities.find(city => city.id === cityId);
      if (selectedCity) {
        onCityChange(cityId, selectedCity.name);
      }
    } else {
      onCityChange(0, '');
    }
  };

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
            value={selectedStateId || ''}
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
              <option key={state.id} value={state.id}>
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
            value={selectedCityId || ''}
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
              <option key={city.id} value={city.id}>
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
      </div>
    </div>
  );
};

export default StatesCitiesSelector;