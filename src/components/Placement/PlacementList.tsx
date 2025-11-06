import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { MapPin, Package } from 'lucide-react';

type GoodsPlacement = Database['public']['Tables']['goods_placement']['Row'];

interface PlacementWithDetails extends GoodsPlacement {
  goods_landing?: {
    goods_id: string;
    goods_type: string;
    quantity: number;
    unit_type: string;
  };
  zone?: {
    zone_code: string;
    description: string;
  };
  operator?: {
    full_name: string;
  };
}

export function PlacementList() {
  const [placements, setPlacements] = useState<PlacementWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('active');

  useEffect(() => {
    loadPlacements();
  }, [filter]);

  const loadPlacements = async () => {
    try {
      let query = supabase
        .from('goods_placement')
        .select(`
          *,
          goods_landing:goods_landing_id(goods_id, goods_type, quantity, unit_type),
          zone:zone_id(zone_code, description),
          operator:operator_id(full_name)
        `)
        .order('placement_time', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPlacements(data as PlacementWithDetails[]);
    } catch (error) {
      console.error('Error loading placements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moved':
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
        <p className="text-center text-slate-600">Loading placements...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Goods Placements</h2>
        </div>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="moved">Moved</option>
            <option value="departed">Departed</option>
          </select>
        </div>
      </div>

      {placements.length === 0 ? (
        <p className="text-center text-slate-600 py-8">No placements found</p>
      ) : (
        <div className="space-y-4">
          {placements.map((placement) => (
            <div
              key={placement.id}
              className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {placement.goods_landing?.goods_id || 'Unknown'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {placement.goods_landing?.goods_type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(placement.status)}`}>
                  {placement.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Zone:</span>
                  <p className="font-medium text-slate-800">
                    {placement.zone?.zone_code || 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Rack:</span>
                  <p className="font-medium text-slate-800">{placement.rack_number}</p>
                </div>
                <div>
                  <span className="text-slate-500">Quantity:</span>
                  <p className="font-medium text-slate-800">
                    {placement.goods_landing?.quantity} {placement.goods_landing?.unit_type}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Placed:</span>
                  <p className="font-medium text-slate-800">
                    {new Date(placement.placement_time).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {placement.notes && (
                <p className="mt-3 text-sm text-slate-600 italic">{placement.notes}</p>
              )}

              {placement.operator && (
                <p className="mt-2 text-xs text-slate-500">
                  Operator: {placement.operator.full_name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
