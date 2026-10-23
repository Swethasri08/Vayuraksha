import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import { InlineLoader } from '../components/LoadingOverlay';

type Mode = 'login' | 'register' | 'forgot';

export function LoginScreen() {
  const { theme, isDark } = useTheme();
  const { login, register, resetPassword, loading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccessMsg('');
    if (!email.trim()) return setError('Please enter your email.');
    if (mode === 'forgot') {
      try {
        await resetPassword(email.trim());
        setSuccessMsg('Password reset link sent! Check your email.');
      } catch (e: any) { setError(e.message); }
      return;
    }
    if (!password) return setError('Please enter your password.');
    if (mode === 'register') {
      if (!name.trim()) return setError('Please enter your full name.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
      try { await register(email.trim(), password, name.trim()); }
      catch (e: any) { setError(e.message); }
    } else {
      try { await login(email.trim(), password); }
      catch (e: any) { setError(e.message); }
    }
  };

  const fillDemo = () => {
    setEmail('demo@vayuraksha.in');
    setPassword('demo1234');
    setMode('login');
    setError('');
  };

  const titles = { login: 'Welcome Back', register: 'Create Account', forgot: 'Reset Password' };
  const subs = {
    login: 'Sign in to your VayuRaksha account',
    register: 'Join the safety monitoring network',
    forgot: 'Enter your email to receive a reset link',
  };

  return (
    <LinearGradient
      colors={isDark ? ['#040B1C', '#071430', '#0A1A40'] : ['#EEF2FF', '#F5F7FF', '#FFFFFF']}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🔥</Text>
            <Text style={[styles.appName, { color: theme.textPrimary }]}>VayuRaksha</Text>
            <Text style={[styles.sub, { color: theme.textSecondary }]}>Smart LPG Safety System</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.lg]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{titles[mode]}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subs[mode]}</Text>

            {mode === 'register' && (
              <InputField label="Full Name" value={name} onChange={setName} placeholder="Dr. Ravi Kumar" icon="👤" theme={theme} />
            )}

            <InputField label="Email" value={email} onChange={setEmail} placeholder="user@vayuraksha.in" icon="📧" keyboardType="email-address" theme={theme} />

            {mode !== 'forgot' && (
              <InputField
                label="Password" value={password} onChange={setPassword}
                placeholder="••••••••" icon="🔒" secure={!showPass}
                theme={theme}
                rightElement={
                  <TouchableOpacity onPress={() => setShowPass(s => !s)}>
                    <Text style={{ color: theme.accent }}>{showPass ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                }
              />
            )}

            {mode === 'register' && (
              <InputField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" icon="🔒" secure theme={theme} />
            )}

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: theme.criticalLight + '20', borderColor: theme.critical + '40' }]}>
                <Text style={[styles.errorText, { color: theme.critical }]}>⚠️ {error}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={[styles.errorBox, { backgroundColor: theme.safeLight + '20', borderColor: theme.safe + '40' }]}>
                <Text style={[styles.errorText, { color: theme.safe }]}>✅ {successMsg}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.accent }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <InlineLoader size={22} /> : (
                <Text style={styles.btnText}>
                  {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </Text>
              )}
            </TouchableOpacity>

            {mode === 'login' && (
              <TouchableOpacity onPress={() => { setMode('forgot'); setError(''); }}>
                <Text style={[styles.link, { color: theme.accent }]}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <View style={styles.switchRow}>
              {mode === 'login' ? (
                <>
                  <Text style={{ color: theme.textSecondary }}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => { setMode('register'); setError(''); }}>
                    <Text style={[styles.link, { color: theme.accent }]}>Register</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={{ color: theme.textSecondary }}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => { setMode('login'); setError(''); }}>
                    <Text style={[styles.link, { color: theme.accent }]}>Sign In</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Demo shortcut */}
          <TouchableOpacity style={[styles.demoBtn, { borderColor: theme.accent + '50' }]} onPress={fillDemo}>
            <Text style={[styles.demoBtnText, { color: theme.accent }]}>🎭 Use Demo Account</Text>
          </TouchableOpacity>
          <Text style={[styles.demoHint, { color: theme.textMuted }]}>demo@vayuraksha.in / demo1234</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function InputField({ label, value, onChange, placeholder, icon, secure, rightElement, keyboardType, theme }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={secure}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
        />
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: Spacing.base, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: Spacing.xxl, gap: 4 },
  logo: { fontSize: 52 },
  appName: { fontSize: Typography.xxl, fontWeight: Typography.extraBold, letterSpacing: 1.5 },
  sub: { fontSize: Typography.xs, letterSpacing: 0.5 },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold },
  subtitle: { fontSize: Typography.sm, marginBottom: 4 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: Typography.xs, fontWeight: Typography.semiBold, letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: { flex: 1, fontSize: Typography.base },
  errorBox: { borderRadius: BorderRadius.sm, borderWidth: 1, padding: Spacing.sm },
  errorText: { fontSize: Typography.sm },
  btn: {
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 50,
  },
  btnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  link: { fontSize: Typography.sm, fontWeight: Typography.semiBold, textAlign: 'center' },
  divider: { height: 1, marginVertical: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  demoBtn: {
    marginTop: Spacing.base,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  demoBtnText: { fontWeight: Typography.semiBold },
  demoHint: { textAlign: 'center', fontSize: Typography.xs, marginTop: 4 },
});
