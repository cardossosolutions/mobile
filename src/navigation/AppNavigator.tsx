import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import LoadingScreen from '../screens/auth/LoadingScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import ApiConfigScreen from '../screens/profile/ApiConfigScreen';
import VisitorScheduleScreen from '../screens/schedule/VisitorScheduleScreen';
import ProviderScheduleScreen from '../screens/schedule/ProviderScheduleScreen';
import DeliveryScheduleScreen from '../screens/schedule/DeliveryScheduleScreen';
import ResidenceManagementScreen from '../screens/management/ResidenceManagementScreen';
import EmployeeManagementScreen from '../screens/management/EmployeeManagementScreen';
import GuestManagementScreen from '../screens/management/GuestManagementScreen';
import AppointmentManagementScreen from '../screens/management/AppointmentManagementScreen';
import ServiceProviderManagementScreen from '../screens/management/ServiceProviderManagementScreen';
import DeliveryManagementScreen from '../screens/management/DeliveryManagementScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const ScheduleTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'VisitorSchedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'ProviderSchedule') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'DeliverySchedule') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
          tabBarStyle: {
              height: 50, // Defina a altura desejada aqui
              paddingBottom: 5, // Adapte o espaçamento interno
          },

      })}
    >
      <Tab.Screen 
        name="VisitorSchedule" 
        component={VisitorScheduleScreen}
        options={{ title: 'Visitantes' }}
      />
      <Tab.Screen 
        name="ProviderSchedule" 
        component={ProviderScheduleScreen}
        options={{ title: 'Prestadores' }}
      />
      <Tab.Screen 
        name="DeliverySchedule" 
        component={DeliveryScheduleScreen}
        options={{ title: 'Entregas' }}
      />
    </Tab.Navigator>
  );
};

const ManagementTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Guests':
              iconName = focused ? 'person-add' : 'person-add-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'ServiceProviders':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Deliveries':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
          tabBarStyle: {
              height: 50, // Defina a altura desejada aqui
              paddingBottom: 5, // Adapte o espaçamento interno
          },
      })}
    >
      <Tab.Screen 
        name="Guests" 
        component={GuestManagementScreen}
        options={{ title: 'Convidados' }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentManagementScreen}
        options={{ title: 'Agendamentos' }}
      />
      <Tab.Screen 
        name="ServiceProviders" 
        component={ServiceProviderManagementScreen}
        options={{ title: 'Prestadores' }}
      />
      <Tab.Screen 
        name="Deliveries" 
        component={DeliveryManagementScreen}
        options={{ title: 'Entregas' }}
      />
    </Tab.Navigator>
  );
};

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Schedule':
              iconName = focused ? 'eye' : 'eye-outline';
              break;
            case 'Residences':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Employees':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Schedule" 
        component={ScheduleTabNavigator}
        options={{ title: 'Cronograma' }}
      />
      <Tab.Screen 
        name="Residences" 
        component={ResidenceManagementScreen}
        options={{ title: 'Residências' }}
      />
      <Tab.Screen 
        name="Employees" 
        component={EmployeeManagementScreen}
        options={{ title: 'Funcionários' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

const MainTabNavigator = () => {
  const { user } = useAuth();

  // Role 4: Admin completo
  if (user?.role === 4) {
    return <AdminTabNavigator />;
  }
  
  // Role 5: Apenas visualização
  if (user?.role === 5) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? 'eye' : 'eye-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Schedule" 
          component={ScheduleTabNavigator}
          options={{ title: 'Cronograma' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Perfil' }}
        />
      </Tab.Navigator>
    );
  }
  
  // Role 6: Gestão operacional
  if (user?.role === 6) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            
            if (route.name === 'Management') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Management" 
          component={ManagementTabNavigator}
          options={{ title: 'Gestão' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Perfil' }}
        />
      </Tab.Navigator>
    );
  }

  // Fallback para roles não reconhecidas
  return <ScheduleTabNavigator />;
};

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="ApiConfig" component={ApiConfigScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}