import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Edit3, Percent, Bell, FileText, DollarSign, Users, Calendar, Check, X } from 'lucide-react';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('structure');
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: 'Paystack', enabled: true, logo: '🟢' },
    { id: 2, name: 'Flutterwave', enabled: true, logo: '🟡' },
    { id: 3, name: 'Stripe', enabled: false, logo: '🟣' },
    { id: 4, name: 'Bank Transfer', enabled: true, logo: '🏦' }
  ]);
  const [feeStructure, setFeeStructure] = useState([
    { id: 1, class: 'Grade 1-3', tuition: 50000, registration: 5000, uniform: 8000 },
    { id: 2, class: 'Grade 4-6', tuition: 65000, registration: 5000, uniform: 10000 },
    { id: 3, class: 'Grade 7-9', tuition: 80000, registration: 7500, uniform: 12000 }
  ]);
  const [discountRules, setDiscountRules] = useState([
    { id: 1, name: 'Sibling Discount', type: 'percentage', value: 15, condition: '2+ siblings' },
    { id: 2, name: 'Early Payment', type: 'percentage', value: 10, condition: 'Before due date' },
    { id: 3, name: 'Staff Child', type: 'percentage', value: 50, condition: 'Staff member' }
  ]);
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    frequency: 'weekly',
    daysBefore: 7
  });

  interface PaymentMethod {
    id: number;
    name: string;
    enabled: boolean;
    logo: string;
  }

  interface FeeStructure {
    id: number;
    class: string;
    tuition: number;
    registration: number;
    uniform: number;
  }

  interface DiscountRule {
    id: number;
    name: string;
    type: string;
    value: number;
    condition: string;
  }

  interface ReminderSettings {
    enabled: boolean;
    frequency: string;
    daysBefore: number;
  }

  const togglePaymentMethod = (id: number) => {
    setPaymentMethods(prev =>
      prev.map((method: PaymentMethod) =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  const tabs = [
    { id: 'structure', label: 'Fee Structure', icon: DollarSign },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'discounts', label: 'Discount Rules', icon: Percent },
    { id: 'templates', label: 'Invoice Templates', icon: FileText },
    { id: 'reminders', label: 'Payment Reminders', icon: Bell }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 shadow-xl border border-slate-200/50 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Finance & Payment Settings
            </h3>
            <p className="text-slate-600 text-sm">Manage your school's financial operations</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-1 bg-slate-100/70 rounded-2xl backdrop-blur-sm">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-100/50 scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-96">
        {/* Fee Structure Tab */}
        {activeTab === 'structure' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-slate-900">School Fee Structure</h4>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
                <Plus className="w-4 h-4" />
                Add Class
              </button>
            </div>
            <div className="grid gap-4">
              {feeStructure.map(fee => (
                <div key={fee.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-semibold text-slate-900">{fee.class}</h5>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">₦{fee.tuition.toLocaleString()}</div>
                      <div className="text-sm text-blue-700">Tuition</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">₦{fee.registration.toLocaleString()}</div>
                      <div className="text-sm text-purple-700">Registration</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl">
                      <div className="text-2xl font-bold text-orange-600">₦{fee.uniform.toLocaleString()}</div>
                      <div className="text-sm text-orange-700">Uniform</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-slate-900">Payment Gateway Integration</h4>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
                <Plus className="w-4 h-4" />
                Add Gateway
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map(method => (
                <div key={method.id} className={`relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                  method.enabled 
                    ? 'border-emerald-200 shadow-emerald-100/20' 
                    : 'border-slate-200/50'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{method.logo}</div>
                      <div>
                        <h5 className="font-semibold text-slate-900">{method.name}</h5>
                        <p className="text-sm text-slate-600">Payment Gateway</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePaymentMethod(method.id)}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                        method.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-300 shadow-sm ${
                          method.enabled ? 'left-6' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  {method.enabled && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm animate-in fade-in duration-300">
                      <Check className="w-4 h-4" />
                      <span>Active & Configured</span>
                    </div>
                  )}
                  {method.enabled && (
                    <button className="mt-3 w-full py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Configure Settings
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discount Rules Tab */}
        {activeTab === 'discounts' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-slate-900">Discount Rules</h4>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>
            <div className="grid gap-4">
              {discountRules.map(rule => (
                <div key={rule.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                        <Percent className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900">{rule.name}</h5>
                        <p className="text-sm text-slate-600">{rule.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{rule.value}%</div>
                        <div className="text-sm text-slate-600">Discount</div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-slate-900">Invoice Template Editor</h4>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
                <Plus className="w-4 h-4" />
                New Template
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium text-slate-900">Available Templates</h5>
                {['Standard Invoice', 'Payment Receipt', 'Fee Statement', 'Reminder Notice'].map((template, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-slate-900">{template}</span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                <h5 className="font-medium text-slate-900 mb-4">Template Preview</h5>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-6 border border-slate-200/50 min-h-64">
                  <div className="text-center mb-6">
                    <h6 className="text-lg font-bold text-slate-900">GREENWOOD ACADEMY</h6>
                    <p className="text-sm text-slate-600">School Fee Invoice</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Student Name:</span>
                      <span className="font-medium">John Doe</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Class:</span>
                      <span className="font-medium">Grade 5</span>
                    </div>
                    <hr className="border-slate-200" />
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tuition Fee:</span>
                      <span className="font-medium">₦65,000</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total Amount:</span>
                      <span className="text-emerald-600">₦65,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-slate-900">Payment Reminder Settings</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Reminders</span>
                <button
                  onClick={() => setReminderSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    reminderSettings.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-300 shadow-sm ${
                      reminderSettings.enabled ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {reminderSettings.enabled && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                  <h5 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    Reminder Schedule
                  </h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                      <select 
                        value={reminderSettings.frequency}
                        onChange={(e) => setReminderSettings(prev => ({ ...prev, frequency: e.target.value }))}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Days Before Due Date</label>
                      <input 
                        type="number" 
                        value={reminderSettings.daysBefore}
                        onChange={(e) => setReminderSettings(prev => ({ ...prev, daysBefore: parseInt(e.target.value) }))}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        min="1"
                        max="30"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                  <h5 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Reminder Types
                  </h5>
                  <div className="space-y-3">
                    {['Email Reminders', 'SMS Notifications', 'In-App Notifications', 'Parent Portal Alerts'].map((type, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200/50">
                        <span className="text-sm font-medium text-slate-700">{type}</span>
                        <button className="relative w-10 h-5 rounded-full bg-emerald-500 transition-all duration-300">
                          <div className="absolute w-4 h-4 bg-white rounded-full top-0.5 left-5 transition-all duration-300 shadow-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;