import 'react-native-gesture-handler';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'FirebaseError: Missing or insufficient permissions',
  'FirebaseError'
]);
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AppNavigator from './src/navigation/AppNavigator';

import { AuthContextProvider } from './src/context/authContext';
import { LoadingProvider } from './src/context/loadingContext';

export default function App() {
  return (
    <LoadingProvider>
      <AuthContextProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <BottomSheetModalProvider>
              <AppNavigator />
            </BottomSheetModalProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </AuthContextProvider>
    </LoadingProvider>
  );
}