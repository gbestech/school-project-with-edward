import React, { useState } from 'react';
import { Lock, Shield, Users, Settings, Eye, EyeOff, Plus, Minus, AlertTriangle, Check, X } from 'lucide-react';
import ToggleSwitch from '@/components/dashboards/admin/settingtab/components/ToggleSwitch';

// TypeScript interfaces
interface CustomField {
  name: string;
  enabled: boolean;
  required: boolean;
}

interface PasswordPolicy {
  minLength: number;
  requireSymbols: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  resetInterval: number;
}

const Security: React.FC = () => {
  // Security Settings State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [ipWhitelist, setIpWhitelist] = useState<string[]>(['192.168.1.0/24', '10.0.0.0/16']);
  const [ipBlacklist, setIpBlacklist] = useState<string[]>(['192.168.100.50']);
  const [newIpWhitelist, setNewIpWhitelist] = useState<string>('');
  const [newIpBlacklist, setNewIpBlacklist] = useState<string>('');
  const [lockoutAttempts, setLockoutAttempts] = useState<number>(5);
  const [lockoutDuration, setLockoutDuration] = useState<number>(15);
  const [autoLogoutTimeout, setAutoLogoutTimeout] = useState<number>(30);
  const [encryptionEnabled, setEncryptionEnabled] = useState<boolean>(true);
  const [encryptionLevel, setEncryptionLevel] = useState<string>('AES-256');

  // User Account Settings State
  const [defaultAvatar, setDefaultAvatar] = useState<string>('initials');
  const [selfRegistration, setSelfRegistration] = useState<boolean>(true);
  const [emailVerification, setEmailVerification] = useState<boolean>(true);
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { name: 'Blood Type', enabled: true, required: false },
    { name: 'Religion', enabled: false, required: false },
    { name: 'Emergency Contact', enabled: true, required: true },
    { name: 'Allergies', enabled: true, required: false }
  ]);
  const [newFieldName, setNewFieldName] = useState<string>('');
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireSymbols: true,
    requireNumbers: true,
    requireUppercase: true,
    resetInterval: 90
  });

  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string>('JBSWY3DPEHPK3PXP');
  const [verificationCode, setVerificationCode] = useState<string>('');

  const handleNumberInput = (value: string, min: number, max: number): number => {
    const num = parseInt(value);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  };

  const addIpToWhitelist = (): void => {
    if (newIpWhitelist.trim() && !ipWhitelist.includes(newIpWhitelist.trim())) {
      setIpWhitelist([...ipWhitelist, newIpWhitelist.trim()]);
      setNewIpWhitelist('');
    }
  };

  const addIpToBlacklist = (): void => {
    if (newIpBlacklist.trim() && !ipBlacklist.includes(newIpBlacklist.trim())) {
      setIpBlacklist([...ipBlacklist, newIpBlacklist.trim()]);
      setNewIpBlacklist('');
    }
  };

  const removeIpFromWhitelist = (ip: string): void => {
    setIpWhitelist(ipWhitelist.filter(item => item !== ip));
  };

  const removeIpFromBlacklist = (ip: string): void => {
    setIpBlacklist(ipBlacklist.filter(item => item !== ip));
  };

  const addCustomField = (): void => {
    if (newFieldName.trim()) {
      setCustomFields([...customFields, { name: newFieldName.trim(), enabled: true, required: false }]);
      setNewFieldName('');
    }
  };

  const removeCustomField = (index: number): void => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, updates: Partial<CustomField>): void => {
    setCustomFields(customFields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ));
  };

  const handleTwoFactorSetup = (): void => {
    setShowTwoFactorSetup(true);
    // Simulate QR code generation
    setTimeout(() => {
      setQrCode('JBSWY3DPEHPK3PXP');
    }, 500);
  };

  const verifyTwoFactor = (): void => {
    if (verificationCode === '123456') {
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      setVerificationCode('');
      alert('2FA enabled successfully!');
    } else {
      alert('Invalid verification code. Try 123456 for demo.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Security Settings */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-700 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          Security Settings
        </h3>

        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="border-b border-slate-100 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-slate-800">Two-Factor Authentication</h4>
                <p className="text-sm text-slate-600">Add an extra layer of security to admin accounts</p>
              </div>
              <div className="flex items-center gap-3">
                {twoFactorEnabled && (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Enabled
                  </span>
                )}
                <button
                  onClick={twoFactorEnabled ? () => setTwoFactorEnabled(false) : handleTwoFactorSetup}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    twoFactorEnabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                  aria-label={twoFactorEnabled ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>

            {showTwoFactorSetup && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white border-2 border-slate-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="text-xs text-slate-500 text-center">
                      QR Code<br />
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 block">
                        {qrCode}
                      </code>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Scan this QR code with your authenticator app or enter the code manually
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    aria-label="Two-factor authentication verification code"
                  />
                  <button
                    onClick={verifyTwoFactor}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    aria-label="Verify two-factor authentication code"
                  >
                    Verify
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center">Demo: Use code "123456" to verify</p>
              </div>
            )}
          </div>

          {/* IP Whitelist/Blacklist */}
          <div className="border-b border-slate-100 pb-6">
            <h4 className="text-lg font-medium text-slate-800 mb-4">IP Access Control</h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Whitelist */}
              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-3">IP Whitelist (Allowed IPs)</h5>
                <div className="space-y-2 mb-3">
                  {ipWhitelist.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                      <code className="text-sm text-green-800">{ip}</code>
                      <button
                        onClick={() => removeIpFromWhitelist(ip)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label={`Remove ${ip} from whitelist`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="192.168.1.0/24"
                    value={newIpWhitelist}
                    onChange={(e) => setNewIpWhitelist(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    aria-label="Add IP address to whitelist"
                  />
                  <button
                    onClick={addIpToWhitelist}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    disabled={!newIpWhitelist.trim()}
                    aria-label="Add IP to whitelist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Blacklist */}
              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-3">IP Blacklist (Blocked IPs)</h5>
                <div className="space-y-2 mb-3">
                  {ipBlacklist.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg">
                      <code className="text-sm text-red-800">{ip}</code>
                      <button
                        onClick={() => removeIpFromBlacklist(ip)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label={`Remove ${ip} from blacklist`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="192.168.1.100"
                    value={newIpBlacklist}
                    onChange={(e) => setNewIpBlacklist(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    aria-label="Add IP address to blacklist"
                  />
                  <button
                    onClick={addIpToBlacklist}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={!newIpBlacklist.trim()}
                    aria-label="Add IP to blacklist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Lockout */}
          <div className="border-b border-slate-100 pb-6">
            <h4 className="text-lg font-medium text-slate-800 mb-4">Account Lockout Policy</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Failed Attempts Before Lockout
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={lockoutAttempts}
                  onChange={(e) => setLockoutAttempts(handleNumberInput(e.target.value, 1, 10))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  aria-label="Failed attempts before lockout"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={lockoutDuration}
                  onChange={(e) => setLockoutDuration(handleNumberInput(e.target.value, 1, 1440))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  aria-label="Lockout duration in minutes"
                />
              </div>
            </div>
          </div>

          {/* Auto-logout */}
          <div className="border-b border-slate-100 pb-6">
            <h4 className="text-lg font-medium text-slate-800 mb-4">Auto-logout Settings</h4>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Inactivity Timeout (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={autoLogoutTimeout}
                onChange={(e) => setAutoLogoutTimeout(handleNumberInput(e.target.value, 5, 480))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                aria-label="Inactivity timeout in minutes"
              />
              <p className="text-xs text-slate-500 mt-1">
                Users will be automatically logged out after this period of inactivity
              </p>
            </div>
          </div>

          {/* Encryption Settings */}
          <div>
            <h4 className="text-lg font-medium text-slate-800 mb-4">Data Encryption</h4>
            <div className="space-y-4">
              <ToggleSwitch
                id="encryption-enabled"
                checked={encryptionEnabled}
                onChange={(checked) => setEncryptionEnabled(checked)}
                label="Enable Encryption for Sensitive Data"
                description="Encrypt health records, personal information, and other sensitive data"
              />
              {encryptionEnabled && (
                <div className="max-w-md ml-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Encryption Level
                  </label>
                  <select
                    value={encryptionLevel}
                    onChange={(e) => setEncryptionLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    aria-label="Encryption level selection"
                  >
                    <option value="AES-128">AES-128</option>
                    <option value="AES-256">AES-256</option>
                    <option value="ChaCha20">ChaCha20</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Account & Profile Settings */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          User Account & Profile Settings
        </h3>

        <div className="space-y-6">
          {/* Default Avatar */}
          <div className="border-b border-slate-100 pb-6">
            <h4 className="text-lg font-medium text-slate-800 mb-4">Default Profile Avatar</h4>
            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                {['initials', 'generic', 'random'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="defaultAvatar"
                      value={type}
                      checked={defaultAvatar === type}
                      onChange={(e) => setDefaultAvatar(e.target.value)}
                      className="text-blue-600"
                      aria-label={`Select ${type} avatar type`}
                    />
                    <span className="text-sm text-slate-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {defaultAvatar === 'initials' ? 'JD' : defaultAvatar === 'generic' ? '👤' : '🎨'}
              </div>
            </div>
          </div>

          {/* Registration & Verification */}
          <div className="border-b border-slate-100 pb-6">
            <h4 className="text-lg font-medium text-slate-800 mb-4">Registration Settings</h4>
            <div className="space-y-3">
              <ToggleSwitch
                id="self-registration"
                checked={selfRegistration}
                onChange={(checked) => setSelfRegistration(checked)}
                label="Allow User Self-Registration"
                description="Users can create accounts without admin approval"
              />
              <ToggleSwitch
                id="email-verification"
                checked={emailVerification}
                onChange={(checked) => setEmailVerification(checked)}
                label="Require Email Verification"
                description="Users must verify their email address before account activation"
              />
            </div>
          </div>

          {/* Custom Profile Fields */}
          <div className="border-b border-slate-100 pb-6">
            <h4 className="text-lg font-medium text-slate-800 mb-4">Custom Profile Fields</h4>
            <div className="space-y-3 mb-4">
              {customFields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={field.enabled}
                      onChange={(e) => updateCustomField(index, { enabled: e.target.checked })}
                      className="text-blue-600"
                      aria-label={`Enable ${field.name} field`}
                    />
                    <span className="text-sm font-medium text-slate-700">{field.name}</span>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateCustomField(index, { required: e.target.checked })}
                        disabled={!field.enabled}
                        className="text-red-600"
                        aria-label={`Make ${field.name} required`}
                      />
                      Required
                    </label>
                  </div>
                  <button
                    onClick={() => removeCustomField(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label={`Remove ${field.name} field`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new field (e.g., Insurance Provider)"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                aria-label="New custom field name"
              />
              <button
                onClick={addCustomField}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                disabled={!newFieldName.trim()}
                aria-label="Add custom field"
              >
                Add Field
              </button>
            </div>
          </div>

          {/* Password Policy */}
          <div>
            <h4 className="text-lg font-medium text-slate-800 mb-4">Password Policy</h4>
            <div className="space-y-4">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  min="6"
                  max="32"
                  value={passwordPolicy.minLength}
                  onChange={(e) => setPasswordPolicy({...passwordPolicy, minLength: handleNumberInput(e.target.value, 6, 32)})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  aria-label="Minimum password length"
                />
              </div>
              
              <div className="space-y-3">
                <ToggleSwitch
                  id="require-symbols"
                  checked={passwordPolicy.requireSymbols}
                  onChange={(checked) => setPasswordPolicy({...passwordPolicy, requireSymbols: checked})}
                  label="Require Special Characters"
                  description="Password must contain at least one symbol (!@#$%^&*)"
                />
                <ToggleSwitch
                  id="require-numbers"
                  checked={passwordPolicy.requireNumbers}
                  onChange={(checked) => setPasswordPolicy({...passwordPolicy, requireNumbers: checked})}
                  label="Require Numbers"
                  description="Password must contain at least one number"
                />
                <ToggleSwitch
                  id="require-uppercase"
                  checked={passwordPolicy.requireUppercase}
                  onChange={(checked) => setPasswordPolicy({...passwordPolicy, requireUppercase: checked})}
                  label="Require Uppercase Letters"
                  description="Password must contain at least one uppercase letter"
                />
              </div>

              <div className="max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password Reset Interval (days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={passwordPolicy.resetInterval}
                  onChange={(e) => setPasswordPolicy({...passwordPolicy, resetInterval: handleNumberInput(e.target.value, 30, 365)})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  aria-label="Password reset interval in days"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Users will be prompted to change their password after this period
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          aria-label="Save all security settings"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default Security;