import { Slot } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <Slot />
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
