'use client';

import { useState } from 'react';
import { Upload, Calculator, BarChart3, Download, FileText } from 'lucide-react';

export default function AccountantApp() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [calculations, setCalculations] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [chartUrl, setChartUrl] = useState<string>('');
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Your Company',
    address: '123 Business St',
    phone: '(555) 123-4567'
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setCalculations(result.calculations);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChart = async (type: string = 'bar') => {
    if (!data.length) return;

    try {
      const response = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          chartType: type,
          title: 'Financial Data Visualization'
        }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setChartUrl(url);
    } catch (error) {
      console.error('Error generating chart:', error);
    }
  };

  const exportReceipt = async () => {
    if (!data.length) return;

    try {
      const response = await fetch('/api/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          calculations,
          companyInfo
        }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'accounting-receipt.pdf';
      a.click();
    } catch (error) {
      console.error('Error generating receipt:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Accountant Web App</h1>
          <p className="text-lg text-gray-600">Upload Excel files, perform calculations, and generate reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Excel File
              </h2>
              
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={loading}
              />
              
              {file && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">File: {file.name}</p>
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-4">
              <h3 className="text-lg font-semibold mb-3">Company Information</h3>
              <input
                type="text"
                placeholder="Company Name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                className="w-full p-2 mb-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                className="w-full p-2 mb-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Phone"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Data Display */}
          <div className="lg:col-span-2">
            {data.length > 0 && (
              <>
                {/* Calculations */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Calculator className="mr-2 h-5 w-5" />
                    Calculations
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(calculations).map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold capitalize">{key}</h4>
                        <p className="text-sm">Total: ${value.sum?.toFixed(2)}</p>
                        <p className="text-sm">Average: ${value.average?.toFixed(2)}</p>
                        <p className="text-sm">Count: {value.count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Data Overview
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(data[0]).map(key => (
                            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value: any, i) => (
                              <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {typeof value === 'number' ? `$${value.toFixed(2)}` : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.length > 5 && (
                      <p className="text-sm text-gray-500 mt-2">Showing first 5 rows of {data.length} total</p>
                    )}
                  </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Charts
                  </h2>
                  
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => generateChart('bar')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Bar Chart
                    </button>
                    <button
                      onClick={() => generateChart('pie')}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Pie Chart
                    </button>
                    <button
                      onClick={() => generateChart('line')}
                      className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                    >
                      Line Chart
                    </button>
                  </div>

                  {chartUrl && (
                    <img src={chartUrl} alt="Chart" className="w-full h-auto rounded-md border" />
                  )}
                </div>

                {/* Export Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Download className="mr-2 h-5 w-5" />
                    Export Receipt
                  </h2>
                  
                  <button
                    onClick={exportReceipt}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF Receipt
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
