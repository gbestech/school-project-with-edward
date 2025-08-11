import React, { useState } from 'react';
import { Lock, Users, EyeOff, Plus, Minus, Check, X } from 'lucide-react';
import ToggleSwitch from '@/components/dashboards/admin/settingtab/components/ToggleSwitch';

const Security: React.FC = () => {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiry: 90
    },
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    ipWhitelist: [],
    auditLogging: true,
    dataEncryption: true
  });

  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);
  const [newIp, setNewIp] = useState('');

  const updateSecuritySetting = (field: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const updatePasswordPolicy = (field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      passwordPolicy: { ...prev.passwordPolicy, [field]: value }
    }));
  };

  const addIpToWhitelist = () => {
    if (newIp && !ipWhitelist.includes(newIp)) {
      setIpWhitelist(prev => [...prev, newIp]);
      setNewIp('');
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    setIpWhitelist(prev => prev.filter(item => item !== ip));
  };

  return (
    <div className="space-y-8">
      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          Two-Factor Authentication
        </h3>

        <div className="space-y-6">
          <ToggleSwitch
            id="two-factor-auth"
            checked={securitySettings.twoFactorAuth}
            onChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)}
            label="Enable Two-Factor Authentication"
            description="Require users to use 2FA for enhanced security"
          />

          {securitySettings.twoFactorAuth && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">2FA Configuration</h4>
              <p className="text-sm text-blue-700">
                Users will be required to set up two-factor authentication on their next login.
                Supported methods: SMS, Email, Authenticator Apps
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Password Policy */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          Password Policy
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              value={securitySettings.passwordPolicy.minLength}
              onChange={(e) => updatePasswordPolicy('minLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="6"
              max="20"
            />
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              id="require-uppercase"
              checked={securitySettings.passwordPolicy.requireUppercase}
              onChange={(checked) => updatePasswordPolicy('requireUppercase', checked)}
              label="Require Uppercase Letters"
              description="Passwords must contain at least one uppercase letter"
            />

            <ToggleSwitch
              id="require-lowercase"
              checked={securitySettings.passwordPolicy.requireLowercase}
              onChange={(checked) => updatePasswordPolicy('requireLowercase', checked)}
              label="Require Lowercase Letters"
              description="Passwords must contain at least one lowercase letter"
            />

            <ToggleSwitch
              id="require-numbers"
              checked={securitySettings.passwordPolicy.requireNumbers}
              onChange={(checked) => updatePasswordPolicy('requireNumbers', checked)}
              label="Require Numbers"
              description="Passwords must contain at least one number"
            />

            <ToggleSwitch
              id="require-special-chars"
              checked={securitySettings.passwordPolicy.requireSpecialChars}
              onChange={(checked) => updatePasswordPolicy('requireSpecialChars', checked)}
              label="Require Special Characters"
              description="Passwords must contain at least one special character"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password Expiry (days)
            </label>
            <input
              type="number"
              value={securitySettings.passwordPolicy.passwordExpiry}
              onChange={(e) => updatePasswordPolicy('passwordExpiry', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="30"
              max="365"
            />
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          Session Management
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="5"
              max="480"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Maximum Login Attempts
            </label>
            <input
              type="number"
              value={securitySettings.maxLoginAttempts}
              onChange={(e) => updateSecuritySetting('maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="3"
              max="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Account Lockout Duration (minutes)
            </label>
            <input
              type="number"
              value={securitySettings.lockoutDuration}
              onChange={(e) => updateSecuritySetting('lockoutDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="5"
              max="1440"
            />
          </div>
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          IP Address Whitelist
        </h3>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={addIpToWhitelist}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {ipWhitelist.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">Whitelisted IP Addresses</h4>
              {ipWhitelist.map((ip, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-mono text-slate-700">{ip}</span>
                  <button
                    onClick={() => removeIpFromWhitelist(ip)}
                    className="p-1 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security Logging */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <EyeOff className="w-4 h-4 text-white" />
          </div>
          Security Logging
        </h3>

        <div className="space-y-6">
          <ToggleSwitch
            id="audit-logging"
            checked={securitySettings.auditLogging}
            onChange={(checked) => updateSecuritySetting('auditLogging', checked)}
            label="Enable Audit Logging"
            description="Log all security-related activities for monitoring"
          />

          <ToggleSwitch
            id="data-encryption"
            checked={securitySettings.dataEncryption}
            onChange={(checked) => updateSecuritySetting('dataEncryption', checked)}
            label="Enable Data Encryption"
            description="Encrypt sensitive data at rest and in transit"
          />

          {securitySettings.auditLogging && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-900 mb-2">Audit Log Configuration</h4>
              <p className="text-sm text-indigo-700">
                The following activities will be logged: login attempts, password changes, 
                permission changes, data access, and security events.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Security;