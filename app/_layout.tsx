import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import { ThemeProvider } from '../contexts/ThemeContext';
export default function RootLayout(){return <AuthProvider><WorkspaceProvider><ThemeProvider><Stack screenOptions={{headerShown:false}}/></ThemeProvider></WorkspaceProvider></AuthProvider>}