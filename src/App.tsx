import React, { useState, useEffect, useMemo } from 'react';
import { Farmer } from './types';
import initialData from './data.json';

const GROUPINGS = ['PTG', 'CPA6', 'CPA3', 'CPA4', 'CPA1', 'CPA2', 'CPA5'];

function App() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize data
  useEffect(() => {
    // In a real app, we would fetch from /api/farmers
    // For this prototype, we use the JSON data and add the 4 activity fields
    const enrichedData = (initialData as any[]).map(f => ({
      ...f,
      planting: 0,
      dry_1: 0,
      wet_1: 0,
      harvest: 0,
      updated_at: new Date().toISOString()
    }));
    setFarmers(enrichedData);
  }, []);

  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      const matchesSearch = f.farmer_name.toLowerCase().includes(search.toLowerCase()) || 
                           f.nzc_field_id.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = groupFilter === '' || f.grouping === groupFilter;
      return matchesSearch && matchesGroup;
    });
  }, [farmers, search, groupFilter]);

  const handleToggle = (id: number, field: keyof Farmer) => {
    setFarmers(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, [field]: f[field] === 1 ? 0 : 1 };
      }
      return f;
    }));
  };

  const calculatePayment = (f: Farmer) => {
    const p1 = (f.planting === 1 && f.dry_1 === 1) ? f.activity_area * 100 : 0;
    const p2 = (f.wet_1 === 1 && f.harvest === 1) ? f.activity_area * 100 : 0;
    return { p1, p2, total: p1 + p2 };
  };

  const totalEarned = useMemo(() => {
    return farmers.reduce((sum, f) => sum + calculatePayment(f).total, 0);
  }, [farmers]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">AWD Verification Dashboard</h1>
            <p className="text-gray-600">Track and verify farmer activities for payments.</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Payments Due</p>
              <p className="text-2xl font-bold text-green-600">{totalEarned.toLocaleString()} THB</p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-semibold">Farmers</p>
              <p className="text-2xl font-bold text-blue-700">{farmers.length}</p>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 sticky top-4 z-10 border border-gray-100">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Search Farmer / ID</label>
            <input 
              type="text" 
              placeholder="Search name or field ID..." 
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by Group</label>
            <select 
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="">All Groups</option>
              {GROUPINGS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Farmer Details</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Phase 1 (Dry)</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Phase 2 (Wet)</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFarmers.map(f => {
                  const { p1, p2, total } = calculatePayment(f);
                  return (
                    <tr key={f.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{f.farmer_name}</p>
                        <div className="flex gap-2 text-xs text-gray-500 mt-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">{f.nzc_field_id}</span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{f.grouping}</span>
                          <span className={`${f.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'} font-semibold`}>{f.status}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 italic">Area: {f.activity_area} Rai</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <ToggleButton 
                            label="Planting" 
                            active={f.planting === 1} 
                            onClick={() => handleToggle(f.id, 'planting')} 
                          />
                          <ToggleButton 
                            label="Dry 1" 
                            active={f.dry_1 === 1} 
                            onClick={() => handleToggle(f.id, 'dry_1')} 
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <ToggleButton 
                            label="Wet 1" 
                            active={f.wet_1 === 1} 
                            onClick={() => handleToggle(f.id, 'wet_1')} 
                          />
                          <ToggleButton 
                            label="Harvest" 
                            active={f.harvest === 1} 
                            onClick={() => handleToggle(f.id, 'harvest')} 
                          />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-sm font-semibold text-gray-400">P1: {p1.toLocaleString()}</div>
                        <div className="text-sm font-semibold text-gray-400">P2: {p2.toLocaleString()}</div>
                        <div className="text-lg font-bold text-blue-700 mt-1">{total.toLocaleString()} THB</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredFarmers.length === 0 && (
            <div className="p-12 text-center text-gray-500 italic">No farmers found matching your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all
        ${active 
          ? 'bg-green-500 text-white shadow-sm ring-2 ring-green-200' 
          : 'bg-gray-100 text-gray-400 border border-gray-200 hover:border-blue-300'}
      `}
    >
      {label}
    </button>
  );
}

export default App;
