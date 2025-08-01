import React, { useState } from 'react';
import { MessageSquare, Mail, Phone, Settings, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

// TypeScript interfaces
interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  digestFrequency: string;
}

interface BrevoConfig {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  isConfigured: boolean;
  testMode: boolean;
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  isConfigured: boolean;
  testMode: boolean;
}

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}

// Enhanced ToggleSwitch component
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-slate-700 cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-slate-200'
        }`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

const CommunicationTab = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    digestFrequency: 'daily'
  });

  const [brevoConfig, setBrevoConfig] = useState<BrevoConfig>({
    apiKey: '',
    senderEmail: '',
    senderName: '',
    isConfigured: false,
    testMode: true
  });

  const [twilioConfig, setTwilioConfig] = useState<TwilioConfig>({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    isConfigured: false,
    testMode: true
  });

  const [showBrevoKey, setShowBrevoKey] = useState(false);
  const [showTwilioToken, setShowTwilioToken] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');

  // Test connection functions
  const testBrevoConnection = async () => {
    try {
      // Simulate API call to Brevo
      console.log('Testing Brevo connection...');
      // In real implementation, you would make an API call to Brevo
      // const response = await fetch('https://api.brevo.com/v3/account', {
      //   headers: {
      //     'api-key': brevoConfig.apiKey,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      setBrevoConfig({ ...brevoConfig, isConfigured: true });
      alert('Brevo connection successful!');
    } catch (error) {
      alert('Brevo connection failed. Please check your API key.');
    }
  };

  const testTwilioConnection = async () => {
    try {
      // Simulate API call to Twilio
      console.log('Testing Twilio connection...');
      // In real implementation, you would make an API call to Twilio
      // const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}.json`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Basic ${btoa(twilioConfig.accountSid + ':' + twilioConfig.authToken)}`
      //   }
      // });
      
      setTwilioConfig({ ...twilioConfig, isConfigured: true });
      alert('Twilio connection successful!');
    } catch (error) {
      alert('Twilio connection failed. Please check your credentials.');
    }
  };

  const sendTestEmail = async () => {
    if (!brevoConfig.isConfigured) {
      alert('Please configure Brevo first');
      return;
    }
    
    try {
      // Simulate sending test email via Brevo
      console.log('Sending test email via Brevo...');
      // In real implementation:
      // const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      //   method: 'POST',
      //   headers: {
      //     'api-key': brevoConfig.apiKey,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     sender: { name: brevoConfig.senderName, email: brevoConfig.senderEmail },
      //     to: [{ email: 'test@example.com' }],
      //     subject: 'Test Email from School Management System',
      //     htmlContent: '<p>This is a test email from your school management system.</p>'
      //   })
      // });
      
      alert('Test email sent successfully!');
    } catch (error) {
      alert('Failed to send test email.');
    }
  };

  const sendTestSMS = async () => {
    if (!twilioConfig.isConfigured) {
      alert('Please configure Twilio first');
      return;
    }
    
    try {
      // Simulate sending test SMS via Twilio
      console.log('Sending test SMS via Twilio...');
      // In real implementation:
      // const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Messages.json`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Basic ${btoa(twilioConfig.accountSid + ':' + twilioConfig.authToken)}`,
      //     'Content-Type': 'application/x-www-form-urlencoded'
      //   },
      //   body: new URLSearchParams({
      //     From: twilioConfig.phoneNumber,
      //     To: '+1234567890', // Test number
      //     Body: 'Test SMS from School Management System'
      //   })
      // });
      
      alert('Test SMS sent successfully!');
    } catch (error) {
      alert('Failed to send test SMS.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Tabs */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          Communication Settings
        </h3>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'notifications'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'email'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Email Setup
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'sms'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SMS Setup
          </button>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-3 h-3 text-blue-600" />
                  </div>
                  Email Notifications
                  {brevoConfig.isConfigured && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </h4>
                <ToggleSwitch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onChange={(checked: boolean) => setSettings({...settings, emailNotifications: checked})}
                  label="Enable email notifications"
                  description="Receive important updates via email using Brevo"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-3 h-3 text-purple-600" />
                  </div>
                  SMS Notifications
                  {twilioConfig.isConfigured && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </h4>
                <ToggleSwitch
                  id="sms-notifications"
                  checked={settings.smsNotifications}
                  onChange={(checked: boolean) => setSettings({ ...settings, smsNotifications: checked })}
                  label="Enable SMS notifications"
                  description="Receive urgent alerts via text message using Twilio"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-green-600" />
                </div>
                In-App Notifications
              </h4>
              <ToggleSwitch
                id="in-app-notifications"
                checked={settings.inAppNotifications}
                onChange={(checked: boolean) => setSettings({ ...settings, inAppNotifications: checked })}
                label="Enable in-app notifications"
                description="Show notifications within the application"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Digest Frequency</label>
              <select 
                value={settings.digestFrequency}
                onChange={(e) => setSettings({...settings, digestFrequency: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        )}

        {/* Email Setup Tab */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Brevo Email Configuration</h4>
                <p className="text-sm text-slate-600">Configure Brevo (formerly Sendinblue) for email delivery</p>
              </div>
              {brevoConfig.isConfigured && (
                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Connected
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Brevo API Key
                </label>
                <div className="relative">
                  <input
                    type={showBrevoKey ? "text" : "password"}
                    value={brevoConfig.apiKey}
                    onChange={(e) => setBrevoConfig({ ...brevoConfig, apiKey: e.target.value })}
                    placeholder="Enter your Brevo API key"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBrevoKey(!showBrevoKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showBrevoKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    value={brevoConfig.senderEmail}
                    onChange={(e) => setBrevoConfig({ ...brevoConfig, senderEmail: e.target.value })}
                    placeholder="noreply@yourschool.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={brevoConfig.senderName}
                    onChange={(e) => setBrevoConfig({ ...brevoConfig, senderName: e.target.value })}
                    placeholder="Your School Name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="brevo-test-mode"
                  checked={brevoConfig.testMode}
                  onChange={(e) => setBrevoConfig({ ...brevoConfig, testMode: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="brevo-test-mode" className="text-sm text-slate-700">
                  Enable test mode (emails won't be sent to actual recipients)
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={testBrevoConnection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Test Connection
                </button>
                
                <button
                  onClick={sendTestEmail}
                  disabled={!brevoConfig.isConfigured}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Test Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SMS Setup Tab */}
        {activeTab === 'sms' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Twilio SMS Configuration</h4>
                <p className="text-sm text-slate-600">Configure Twilio for SMS delivery</p>
              </div>
              {twilioConfig.isConfigured && (
                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Connected
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account SID
                </label>
                <input
                  type="text"
                  value={twilioConfig.accountSid}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })}
                  placeholder="Enter your Twilio Account SID"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Auth Token
                </label>
                <div className="relative">
                  <input
                    type={showTwilioToken ? "text" : "password"}
                    value={twilioConfig.authToken}
                    onChange={(e) => setTwilioConfig({ ...twilioConfig, authToken: e.target.value })}
                    placeholder="Enter your Twilio Auth Token"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTwilioToken(!showTwilioToken)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showTwilioToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Twilio Phone Number
                </label>
                <input
                  type="tel"
                  value={twilioConfig.phoneNumber}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, phoneNumber: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="twilio-test-mode"
                  checked={twilioConfig.testMode}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, testMode: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="twilio-test-mode" className="text-sm text-slate-700">
                  Enable test mode (SMS won't be sent to actual numbers)
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={testTwilioConnection}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Test Connection
                </button>
                
                <button
                  onClick={sendTestSMS}
                  disabled={!twilioConfig.isConfigured}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Send Test SMS
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-800">Important Notes</h5>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• SMS charges apply based on your Twilio pricing plan</li>
                    <li>• Verify your Twilio phone number is SMS-enabled</li>
                    <li>• Test mode prevents actual SMS delivery</li>
                    <li>• Ensure compliance with local SMS regulations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationTab;