
import { Shield, Settings2, PlusCircle, UserCheck, Pencil } from 'lucide-react';
import ToggleSwitch from '@/components/dashboards/admin/settingtab/components/ToggleSwitch';

const RolesPermissions = () => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-inner">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900">Roles & Permissions</h3>
      </div>

      {/* Description */}
      <p className="text-slate-600 mb-6">
        Manage user roles and fine-tune permissions for various modules in your system.
      </p>

      {/* Role Management Section */}
      <div className="mb-10">
        <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-600" />
          Default Roles
        </h4>
        <ul className="space-y-3">
          {['Admin', 'Teacher', 'Student', 'Parent', 'Staff'].map((role) => (
            <li key={role} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
              <span className="text-slate-700 font-medium">{role}</span>
              <button className="text-sm flex items-center gap-1 text-primary hover:underline">
                <Pencil className="w-4 h-4" /> Edit Permissions
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Granular Permissions */}
      <div className="mb-10">
        <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-indigo-600" />
          Module Permissions
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {['Attendance', 'Results', 'Messaging', 'Payments', 'Events', 'Library'].map((module) => (
            <div key={module} className="p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-700 font-medium">{module}</span>
              </div>
              <div className="space-y-2">
                {['View', 'Edit', 'Delete'].map((action) => (
                  <div key={action} className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">{action}</span>
                    <ToggleSwitch
                      id={`${module}-${action}`}
                      checked={false}
                      onChange={() => {}}
                      label={action}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Role Creation */}
      <div>
        <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-pink-600" />
          Create Custom Role
        </h4>
        <form className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
            <input
              type="text"
              placeholder="e.g. Supervisor"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Assign Permissions</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {['Attendance', 'Results', 'Messaging', 'Payments', 'Library'].map((perm) => (
                <div key={perm} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">{perm}</span>
                  <ToggleSwitch
                    id={`custom-role-${perm}`}
                    checked={false}
                    onChange={() => {}}
                    label={perm}
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white font-medium rounded-lg hover:shadow-lg transition"
          >
            Create Role
          </button>
        </form>
      </div>
    </div>
  );
};

export default RolesPermissions;
