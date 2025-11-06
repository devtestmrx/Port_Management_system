import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart3, Package, TruckIcon, Warehouse, Clock } from 'lucide-react';
import { Database } from '../../lib/database.types';

type Zone = Database['public']['Tables']['zones']['Row'];

interface KPIData {
  totalGoods: number;
  landedGoods: number;
  placedGoods: number;
  inTransitGoods: number;
  totalMovements: number;
  avgDwellTime: number;
  movementsToday: number;
}

export function Dashboard() {
  const [kpis, setKpis] = useState<KPIData>({
    totalGoods: 0,
    landedGoods: 0,
    placedGoods: 0,
    inTransitGoods: 0,
    totalMovements: 0,
    avgDwellTime: 0,
    movementsToday: 0,
  });
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: goodsData } = await supabase
        .from('goods_landing')
        .select('status, arrival_time');

      const { data: movementsData } = await supabase
        .from('movements')
        .select('movement_time, status');

      const { data: zonesData } = await supabase
        .from('zones')
        .select('*')
        .order('zone_code');

      const totalGoods = goodsData?.length || 0;
      const landedGoods = goodsData?.filter(g => g.status === 'landed').length || 0;
      const placedGoods = goodsData?.filter(g => g.status === 'placed').length || 0;
      const inTransitGoods = goodsData?.filter(g => g.status === 'in_transit').length || 0;

      const totalMovements = movementsData?.filter(m => m.status === 'completed').length || 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const movementsToday = movementsData?.filter(m => {
        const movementDate = new Date(m.movement_time);
        return movementDate >= today && m.status === 'completed';
      }).length || 0;

      let avgDwellTime = 0;
      if (goodsData && goodsData.length > 0) {
        const dwellTimes = goodsData
          .filter(g => g.status === 'placed' || g.status === 'departed')
          .map(g => {
            const arrival = new Date(g.arrival_time);
            const now = new Date();
            return (now.getTime() - arrival.getTime()) / (1000 * 60 * 60);
          });

        if (dwellTimes.length > 0) {
          avgDwellTime = dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length;
        }
      }

      setKpis({
        totalGoods,
        landedGoods,
        placedGoods,
        inTransitGoods,
        totalMovements,
        avgDwellTime,
        movementsToday,
      });

      setZones(zonesData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationPercentage = (zone: Zone) => {
    if (zone.capacity === 0) return 0;
    return (zone.current_occupancy / zone.capacity) * 100;
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-800">Port Operations Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Goods</p>
              <p className="text-3xl font-bold text-slate-800">{kpis.totalGoods}</p>
            </div>
            <Package className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Landed (Awaiting Placement)</p>
              <p className="text-3xl font-bold text-slate-800">{kpis.landedGoods}</p>
            </div>
            <Package className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Placed in Zones</p>
              <p className="text-3xl font-bold text-slate-800">{kpis.placedGoods}</p>
            </div>
            <Warehouse className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">In Transit</p>
              <p className="text-3xl font-bold text-slate-800">{kpis.inTransitGoods}</p>
            </div>
            <TruckIcon className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <TruckIcon className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-slate-700">Total Movements</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{kpis.totalMovements}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-slate-700">Avg. Dwell Time</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{kpis.avgDwellTime.toFixed(1)} hrs</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <p className="font-semibold text-slate-700">Moves Today</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{kpis.movementsToday}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Warehouse className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Zone Occupancy Heat Map</h2>
        </div>

        {zones.length === 0 ? (
          <p className="text-center text-slate-600 py-8">No zones configured</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {zones.map((zone) => {
              const utilization = getUtilizationPercentage(zone);
              return (
                <div
                  key={zone.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">{zone.zone_code}</h3>
                    <span className="text-sm font-medium text-slate-600">
                      {utilization.toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all ${getUtilizationColor(utilization)}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{zone.current_occupancy} / {zone.capacity}</span>
                    <span className="text-xs">{zone.zone_type}</span>
                  </div>

                  {zone.status !== 'active' && (
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                        {zone.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Overall Zone Utilization</h2>
        <div className="space-y-3">
          {zones.filter(z => z.status === 'active').map((zone) => {
            const utilization = getUtilizationPercentage(zone);
            return (
              <div key={zone.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{zone.zone_code}</span>
                  <span className="text-slate-600">
                    {zone.current_occupancy} / {zone.capacity} ({utilization.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${getUtilizationColor(utilization)}`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
