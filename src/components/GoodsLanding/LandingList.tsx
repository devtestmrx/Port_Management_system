import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Package, Clock, MapPin, Truck } from 'lucide-react';

type GoodsLanding = Database['public']['Tables']['goods_landing']['Row'];

interface GoodsLandingWithClerk extends GoodsLanding {
  landing_clerk?: {
    full_name: string;
  };
}

export function LandingList() {
  const [landings, setLandings] = useState<GoodsLandingWithClerk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadLandings();
  }, [filter]);

  const loadLandings = async () => {
    try {
      let query = supabase
        .from('goods_landing')
        .select(`
          *,
          landing_clerk:profiles!landing_clerk_id(full_name)
        `)
        .order('arrival_time', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLandings(data as GoodsLandingWithClerk[]);
    } catch (error) {
      console.error('Error loading landings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'landed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'placed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'departed':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-slate-600">Loading goods landings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Goods Landings</h2>
        </div>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="landed">Landed</option>
            <option value="placed">Placed</option>
            <option value="in_transit">In Transit</option>
            <option value="departed">Departed</option>
          </select>
        </div>
      </div>

      {landings.length === 0 ? (
        <p className="text-center text-slate-600 py-8">No goods landings found</p>
      ) : (
        <div className="space-y-4">
          {landings.map((landing) => (
            <div
              key={landing.id}
              className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{landing.goods_id}</h3>
                  <p className="text-sm text-slate-600">{landing.goods_type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(landing.status)}`}>
                  {landing.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(landing.arrival_time).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{landing.origin}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Truck className="w-4 h-4" />
                  <span>{landing.transport_mode.toUpperCase()}: {landing.vessel_name}</span>
                </div>
                <div className="text-slate-600">
                  <span className="font-medium">{landing.quantity}</span> {landing.unit_type}
                </div>
              </div>

              {landing.notes && (
                <p className="mt-3 text-sm text-slate-600 italic">{landing.notes}</p>
              )}

              {landing.landing_clerk && (
                <p className="mt-2 text-xs text-slate-500">
                  Recorded by: {landing.landing_clerk.full_name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
