import React, { useState, useEffect } from 'react';
import { Bug, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface DebugInfoProps {
  isVisible?: boolean;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ isVisible = false }) => {
  const [apiStatus, setApiStatus] = useState<{
    sections: boolean;
    academicYears: boolean;
    terms: boolean;
    teachers: boolean;
  }>({
    sections: false,
    academicYears: false,
    terms: false,
    teachers: false,
  });

  const [authStatus, setAuthStatus] = useState<{
    hasToken: boolean;
    tokenLength: number;
    userData: boolean;
  }>({
    hasToken: false,
    tokenLength: 0,
    userData: false,
  });

  const testAPI = async () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    setAuthStatus({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      userData: !!userData,
    });

    if (!token) {
      setApiStatus({
        sections: false,
        academicYears: false,
        terms: false,
        teachers: false,
      });
      return;
    }

    const endpoints = [
      { key: 'sections', url: 'http://localhost:8000/api/classrooms/sections/' },
      { key: 'academicYears', url: 'http://localhost:8000/api/classrooms/academic-years/' },
      { key: 'terms', url: 'http://localhost:8000/api/classrooms/terms/' },
      { key: 'teachers', url: 'http://localhost:8000/api/classrooms/teachers/' },
    ];

    const newStatus = { ...apiStatus };

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        newStatus[endpoint.key as keyof typeof newStatus] = response.ok;
      } catch (error) {
        newStatus[endpoint.key as keyof typeof newStatus] = false;
      }
    }

    setApiStatus(newStatus);
  };

  useEffect(() => {
    if (isVisible) {
      testAPI();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <Bug size={16} className="text-gray-600" />
        <h3 className="font-semibold text-sm">Debug Info</h3>
        <button
          onClick={testAPI}
          className="ml-auto p-1 hover:bg-gray-100 rounded"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium">Auth Token:</span>
          {authStatus.hasToken ? (
            <CheckCircle size={12} className="text-green-500" />
          ) : (
            <XCircle size={12} className="text-red-500" />
          )}
          <span className="text-gray-600">({authStatus.tokenLength} chars)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">User Data:</span>
          {authStatus.userData ? (
            <CheckCircle size={12} className="text-green-500" />
          ) : (
            <XCircle size={12} className="text-red-500" />
          )}
        </div>

        <div className="border-t pt-2 mt-2">
          <div className="font-medium mb-1">API Endpoints:</div>
          {Object.entries(apiStatus).map(([key, status]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="capitalize">{key}:</span>
              {status ? (
                <CheckCircle size={12} className="text-green-500" />
              ) : (
                <XCircle size={12} className="text-red-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugInfo; 