// import React, { useState } from 'react';
// import { toast } from 'react-toastify';
// import api from '@/services/api';

// const PasswordRecovery: React.FC = () => {
//   const [username, setUsername] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<{
//     success: boolean;
//     message: string;
//     newPassword?: string;
//     userDetails?: any;
//   } | null>(null);

//   const handlePasswordReset = async () => {
//     if (!username.trim()) {
//       toast.error('Please enter a username');
//       return;
//     }

//     setLoading(true);
//     setResult(null);

//     try {
//       // Resolve username across students/teachers/parents and derive user_id
//       const resolveUserByUsername = async (uname: string): Promise<{ user_id: number; details: any } | null> => {
//         // Helper to normalize list responses
//         const toArray = (res: any) => Array.isArray(res) ? res : (Array.isArray(res?.results) ? res.results : (Array.isArray(res?.data) ? res.data : []));

//         // 1) Students
//         try {
//           const stRes = await api.get('/api/students/students/', { params: { search: uname } });
//           const stList: any[] = toArray(stRes);
//           const stMatch = stList.find((s: any) => (s.user?.username || s.username) === uname);
//           if (stMatch) {
//             const uid = Number(stMatch.user?.id || stMatch.id);
//             if (uid) return { user_id: uid, details: { username: uname, full_name: stMatch.user?.full_name || stMatch.full_name, email: stMatch.user?.email || stMatch.email, phone: stMatch.user?.phone || stMatch.phone } };
//           }
//         } catch {}

//         // 2) Teachers
//         try {
//           const tRes = await api.get('/api/teachers/teachers/', { params: { search: uname } });
//           const tList: any[] = toArray(tRes);
//           const tMatch = tList.find((t: any) => (t.user?.username || t.username) === uname);
//           if (tMatch) {
//             const uid = Number(tMatch.user?.id || tMatch.id);
//             if (uid) return { user_id: uid, details: { username: uname, full_name: tMatch.user?.full_name || tMatch.full_name, email: tMatch.user?.email || tMatch.email, phone: tMatch.user?.phone || tMatch.phone } };
//           }
//         } catch {}

//         // 3) Parents (use dedicated search endpoint if available)
//         try {
//           let pRes: any = await api.get(`/api/parents/search/`, { params: { q: uname } });
//           let pList: any[] = toArray(pRes);
//           if (!Array.isArray(pList) || pList.length === 0) {
//             // Fallback to list with search param
//             pRes = await api.get('/api/parents/', { params: { search: uname } });
//             pList = toArray(pRes);
//           }
//           const pMatch = pList.find((p: any) => (p.user?.username || p.username) === uname);
//           if (pMatch) {
//             const uid = Number(pMatch.user?.id || pMatch.id);
//             if (uid) return { user_id: uid, details: { username: uname, full_name: pMatch.user?.full_name || pMatch.full_name, email: pMatch.user?.email || pMatch.email, phone: pMatch.user?.phone || pMatch.phone } };
//           }
//         } catch {}

//         return null;
//       };

//       const input = username.trim();
//       const prefix = (input.split('/')[0] || '').toUpperCase();
//       const resolved = await (async () => {
//         // Route by prefix to avoid wrong endpoints
//         if (prefix === 'TCH') {
//           // Teachers only
//           const toArray = (res: any) => Array.isArray(res) ? res : (Array.isArray(res?.results) ? res.results : (Array.isArray(res?.data) ? res.data : []));
//           try {
//             const tRes = await api.get('/api/teachers/teachers/', { params: { search: input } });
//             const tList: any[] = toArray(tRes);
//             const tMatch = tList.find((t: any) => (t.user?.username || t.username) === input);
//             if (tMatch) {
//               const uid = Number(tMatch.user?.id || tMatch.id);
//               if (uid) return { user_id: uid, details: { username: input, full_name: tMatch.user?.full_name || tMatch.full_name, email: tMatch.user?.email || tMatch.email, phone: tMatch.user?.phone || tMatch.phone } };
//             }
//           } catch {}
//           return null;
//         }
//         if (prefix === 'STU') {
//           return await resolveUserByUsername(input);
//         }
//         if (prefix === 'PAR') {
//           return await resolveUserByUsername(input);
//         }
//         if (prefix === 'ADM') {
//           // Admins are general users; attempt teachers then students then parents
//           return await resolveUserByUsername(input);
//         }
//         // Unknown prefix, try broad resolve
//         return await resolveUserByUsername(input);
//       })();
//       if (!resolved) {
//         setResult({ success: false, message: 'User not found. Please check the username.' });
//         return;
//       }

//       // Generate a new password
//       const newPassword = generatePassword();

//       // Reset password via admin endpoint using resolved user_id
//       await api.post(`/api/auth/admin-reset-password/`, {
//         user_id: resolved.user_id,
//         new_password: newPassword
//       });

//       setResult({
//         success: true,
//         message: 'Password reset successful!',
//         newPassword,
//         userDetails: resolved.details
//       });

//       toast.success('Password reset successful!');
//     } catch (error: any) {
//       console.error('Password reset error:', error);
//       setResult({
//         success: false,
//         message: error.response?.data?.detail || 'Failed to reset password. Please try again.'
//       });
//       toast.error('Failed to reset password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generatePassword = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let password = '';
//     for (let i = 0; i < 12; i++) {
//       password += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return password;
//   };

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     toast.success('Copied to clipboard!');
//   };

//   return (
//     <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4">Password Recovery</h2>
      
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="flex-1 p-3 border border-gray-300 rounded-lg"
//             placeholder="Enter username (e.g., PAR/GTS/AUG/25/001)"
//           />
//           <button
//             onClick={handlePasswordReset}
//             disabled={loading}
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
//           >
//             {loading ? 'Resetting...' : 'Reset Password'}
//           </button>
//         </div>
//       </div>

//       {result && (
//         <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
//           <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
//             {result.success ? '✅ Success' : '❌ Error'}
//           </h3>
//           <p className={`mb-3 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
//             {result.message}
//           </p>
          
//           {result.success && result.newPassword && result.userDetails && (
//             <div className="bg-white p-4 rounded border border-green-300">
//               <h4 className="font-semibold text-gray-800 mb-3">New Credentials</h4>
              
//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-1">Username:</label>
//                   <div className="flex items-center gap-2">
//                     <span className="font-mono bg-gray-100 px-3 py-2 rounded flex-1">
//                       {result.userDetails.username}
//                     </span>
//                     <button
//                       onClick={() => copyToClipboard(result.userDetails.username)}
//                       className="text-blue-600 hover:text-blue-800 text-sm underline"
//                     >
//                       Copy
//                     </button>
//                   </div>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-1">New Password:</label>
//                   <div className="flex items-center gap-2">
//                     <span className="font-mono bg-gray-100 px-3 py-2 rounded flex-1">
//                       {result.newPassword}
//                     </span>
//                     <button
//                       onClick={() => copyToClipboard(result.newPassword || '')}
//                       className="text-blue-600 hover:text-blue-800 text-sm underline"
//                     >
//                       Copy
//                     </button>
//                   </div>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-1">User Details:</label>
//                   <div className="text-sm text-gray-700">
//                     <p><strong>Name:</strong> {result.userDetails.full_name}</p>
//                     <p><strong>Email:</strong> {result.userDetails.email}</p>
//                     <p><strong>Phone:</strong> {result.userDetails.phone}</p>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
//                 <p className="text-sm text-yellow-800">
//                   <strong>Important:</strong> Please copy and save these credentials. The password will not be shown again.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PasswordRecovery; 


import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';

const PasswordRecovery: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    newPassword?: string;
    userDetails?: any;
  } | null>(null);

  const handlePasswordReset = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const input = username.trim();
      const prefix = (input.split('/')[0] || '').toUpperCase();

      let resolved: { user_id: number; details: any } | null = null;

      // Route by prefix
      if (prefix === 'ADM') {
        // Handle admin users - search directly in users endpoint
        try {
          const usersRes = await api.get('/api/profiles/users/', { params: { search: input } });
          const usersList = Array.isArray(usersRes.data) ? usersRes.data : 
                           Array.isArray(usersRes.data?.results) ? usersRes.data.results : [];
          
          const adminMatch = usersList.find((u: any) => 
            u.username === input && u.role === 'admin'
          );

          if (adminMatch) {
            resolved = {
              user_id: adminMatch.id,
              details: {
                username: adminMatch.username,
                full_name: `${adminMatch.first_name} ${adminMatch.last_name}`,
                email: adminMatch.email,
                phone: adminMatch.phone || 'N/A',
                role: 'Admin'
              }
            };
          }
        } catch (error) {
          console.error('Error searching for admin:', error);
        }
      } else if (prefix === 'TCH') {
        // Teachers
        try {
          const tRes = await api.get('/api/teachers/teachers/', { params: { search: input } });
          const tList = Array.isArray(tRes.data) ? tRes.data : 
                       Array.isArray(tRes.data?.results) ? tRes.data.results : [];
          const tMatch = tList.find((t: any) => (t.user?.username || t.username) === input);
          
          if (tMatch) {
            const uid = Number(tMatch.user?.id || tMatch.id);
            if (uid) {
              resolved = {
                user_id: uid,
                details: {
                  username: input,
                  full_name: tMatch.user?.full_name || tMatch.full_name,
                  email: tMatch.user?.email || tMatch.email,
                  phone: tMatch.user?.phone || tMatch.phone,
                  role: 'Teacher'
                }
              };
            }
          }
        } catch (error) {
          console.error('Error searching for teacher:', error);
        }
      } else if (prefix === 'STU') {
        // Students
        try {
          const stRes = await api.get('/api/students/students/', { params: { search: input } });
          const stList = Array.isArray(stRes.data) ? stRes.data : 
                        Array.isArray(stRes.data?.results) ? stRes.data.results : [];
          const stMatch = stList.find((s: any) => (s.user?.username || s.username) === input);
          
          if (stMatch) {
            const uid = Number(stMatch.user?.id || stMatch.id);
            if (uid) {
              resolved = {
                user_id: uid,
                details: {
                  username: input,
                  full_name: stMatch.user?.full_name || stMatch.full_name,
                  email: stMatch.user?.email || stMatch.email,
                  phone: stMatch.user?.phone || stMatch.phone,
                  role: 'Student'
                }
              };
            }
          }
        } catch (error) {
          console.error('Error searching for student:', error);
        }
      } else if (prefix === 'PAR') {
        // Parents
        try {
          let pRes = await api.get(`/api/parents/search/`, { params: { q: input } });
          let pList = Array.isArray(pRes.data) ? pRes.data : 
                     Array.isArray(pRes.data?.results) ? pRes.data.results : [];
          
          if (!Array.isArray(pList) || pList.length === 0) {
            pRes = await api.get('/api/parents/', { params: { search: input } });
            pList = Array.isArray(pRes.data) ? pRes.data : 
                   Array.isArray(pRes.data?.results) ? pRes.data.results : [];
          }
          
          const pMatch = pList.find((p: any) => (p.user?.username || p.username) === input);
          
          if (pMatch) {
            const uid = Number(pMatch.user?.id || pMatch.id);
            if (uid) {
              resolved = {
                user_id: uid,
                details: {
                  username: input,
                  full_name: pMatch.user?.full_name || pMatch.full_name,
                  email: pMatch.user?.email || pMatch.email,
                  phone: pMatch.user?.phone || pMatch.phone,
                  role: 'Parent'
                }
              };
            }
          }
        } catch (error) {
          console.error('Error searching for parent:', error);
        }
      }

      if (!resolved) {
        setResult({ 
          success: false, 
          message: 'User not found. Please check the username and try again.' 
        });
        toast.error('User not found');
        return;
      }

      // Generate a new password
      const newPassword = generatePassword();

      // Reset password via admin endpoint
      await api.post(`/api/auth/admin-reset-password/`, {
        user_id: resolved.user_id,
        new_password: newPassword
      });

      setResult({
        success: true,
        message: 'Password reset successful!',
        newPassword,
        userDetails: resolved.details
      });

      toast.success('Password reset successful!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setResult({
        success: false,
        message: error.response?.data?.error || error.response?.data?.detail || 'Failed to reset password. Please try again.'
      });
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%';
    const all = uppercase + lowercase + numbers + special;
    
    let password = '';
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));
    
    for (let i = 4; i < 12; i++) {
      password += all.charAt(Math.floor(Math.random() * all.length));
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Password Recovery</h2>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Supported User Types:</strong> Students (STU), Teachers (TCH), Parents (PAR), and Admins (ADM)
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Example: ADM/GTS/OCT/25/001, TCH/GTS/SEP/25/002, STU/GTS/AUG/25/003
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg"
            placeholder="Enter username (e.g., ADM/GTS/OCT/25/001)"
          />
          <button
            onClick={handlePasswordReset}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>

      {result && (
        <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅ Success' : '❌ Error'}
          </h3>
          <p className={`mb-3 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.message}
          </p>
          
          {result.success && result.newPassword && result.userDetails && (
            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-semibold text-gray-800 mb-3">New Credentials</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">User Role:</label>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">
                    {result.userDetails.role}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Username:</label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-3 py-2 rounded flex-1 text-sm">
                      {result.userDetails.username}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.userDetails.username)}
                      className="px-3 py-2 text-xs text-blue-600 hover:bg-blue-100 rounded border border-blue-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">New Password:</label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-3 py-2 rounded flex-1 text-sm">
                      {result.newPassword}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.newPassword || '')}
                      className="px-3 py-2 text-xs text-blue-600 hover:bg-blue-100 rounded border border-blue-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">User Details:</label>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    <p><strong>Name:</strong> {result.userDetails.full_name}</p>
                    <p><strong>Email:</strong> {result.userDetails.email}</p>
                    <p><strong>Phone:</strong> {result.userDetails.phone}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please copy and save these credentials. The password will not be shown again. 
                  The user should change this password upon their next login.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordRecovery;