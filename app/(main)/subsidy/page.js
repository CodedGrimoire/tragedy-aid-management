'use client';

import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function SubsidyPage() {
  const [subsidies, setSubsidies] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalFamilies, setTotalFamilies] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubsidyData();
  }, []);

  const fetchSubsidyData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subsidy');
      if (response.ok) {
        const data = await response.json();

        setSubsidies(data);
        setTotalAmount(data.reduce((sum, item) => sum + (item.amount || 0), 0));
        setTotalFamilies(new Set(data.map(item => item.familyID)).size); // Unique family count

        // Aggregate data for graph
        const supportData = data.reduce((acc, curr) => {
          acc[curr.supportType] = (acc[curr.supportType] || 0) + curr.amount;
          return acc;
        }, {});

        setChartData({
          labels: Object.keys(supportData),
          datasets: [
            {
              label: 'Total Subsidy (৳)',
              data: Object.values(supportData),
              backgroundColor: ['#e63946', '#f4a261', '#2a9d8f', '#264653', '#e76f51'],
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        });
      } else {
        console.error('Failed to fetch subsidies');
      }
    } catch (error) {
      console.error('Error fetching subsidy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search term
  const filteredSubsidies = subsidies.filter(subsidy => 
    subsidy.headName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subsidy.familyID.toString().includes(searchTerm) ||
    subsidy.supportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Subsidy Distribution Dashboard</h1>
          <p className="text-gray-500 mt-2">Monitoring and tracking subsidy allocation to families</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-lg font-medium opacity-90 mb-1">Total Subsidy Given</h2>
            <p className="text-4xl font-bold">৳{totalAmount.toLocaleString()}</p>
            <div className="mt-4 h-1 bg-white bg-opacity-20 rounded-full">
              <div className="h-1 bg-white rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-lg font-medium text-gray-600 mb-1">Total Families Helped</h2>
            <p className="text-4xl font-bold text-gray-800">{totalFamilies}</p>
            <div className="mt-4 h-1 bg-gray-100 rounded-full">
              <div className="h-1 bg-red-500 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {chartData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Subsidy Distribution by Type</h2>
            <div className="h-80">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 15,
                        usePointStyle: true,
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#111827',
                      bodyColor: '#4B5563',
                      bodyFont: {
                        size: 13
                      },
                      borderColor: '#E5E7EB',
                      borderWidth: 1,
                      padding: 12,
                      boxPadding: 6,
                      usePointStyle: true,
                      callbacks: {
                        label: function(context) {
                          return `৳${context.raw.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: '#F3F4F6'
                      },
                      ticks: {
                        color: '#6B7280',
                        callback: function(value) {
                          return '৳' + value.toLocaleString();
                        }
                      },
                      title: {
                        display: true,
                        text: 'Amount in ৳',
                        color: '#4B5563',
                        font: {
                          size: 12,
                          weight: '500'
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: '#6B7280'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Search and Data Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2 md:mb-0">Subsidy Records</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, family ID or support type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-red-600 to-red-500 text-white">
                  <th className="px-4 py-3 text-left">Support ID</th>
                  <th className="px-4 py-3 text-left">Family ID</th>
                  <th className="px-4 py-3 text-left">Head Name</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Address</th>
                  <th className="px-4 py-3 text-left">Support Type</th>
                  <th className="px-4 py-3 text-right">Amount (৳)</th>
                  <th className="px-4 py-3 text-left">Date Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubsidies.length > 0 ? (
                  filteredSubsidies.map((subsidy) => (
                    <tr 
                      key={subsidy.supportID} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-gray-800">{subsidy.supportID}</td>
                      <td className="px-4 py-3 text-gray-800">{subsidy.familyID}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{subsidy.headName}</td>
                      <td className="px-4 py-3 text-gray-600">{subsidy.contact}</td>
                      <td className="px-4 py-3 text-gray-600">{subsidy.address}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {subsidy.supportType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">৳{subsidy.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(subsidy.dateReceived).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No matching subsidy records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Confidential information - Access restricted to authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}