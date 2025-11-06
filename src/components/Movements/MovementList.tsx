import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { TruckIcon, ArrowRight } from 'lucide-react';

type Movement = Database['public']['Tables']['movements']['Row'];

interface MovementWithDetails extends Movement {
  goods_landing?: {
    goods_id: string;
    goods_type: string;
  };
  from_zone?: {
    zone_code: string;
  };
  to_zone?: {
    zone_code: string;
  };
  operator?: {
    full_name: string;
  };
}

export function MovementList() {
  const [movements, setMovements] = useState<MovementWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('movements')
        .select(`
          *,
          goods_landing:goods_landing_id(goods_id, goods_type),
          from_zone:from_zone_id(zone_code),
          to_zone:to_zone_id(zone_code),
          operator:operator_id(full_name)
        `)
        .order('movement_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMovements(data as MovementWithDetails[]);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-slate-600">Loading movements...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <TruckIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">Movement History</h2>
      </div>

      {movements.length === 0 ? (
        <p className="text-center text-slate-600 py-8">No movements recorded</p>
      ) : (
        <div className="space-y-4">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {movement.goods_landing?.goods_id || 'Unknown'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {movement.goods_landing?.goods_type || 'Unknown type'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(movement.status)}`}>
                  {movement.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                    {movement.from_zone?.zone_code || 'Unknown'}
                  </div>
                  <span className="text-slate-500">{movement.from_rack}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded font-medium">
                    {movement.to_zone?.zone_code || 'Unknown'}
                  </div>
                  <span className="text-slate-500">{movement.to_rack}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Reason:</span>
                  <p className="font-medium text-slate-800">{movement.reason}</p>
                </div>
                <div>
                  <span className="text-slate-500">Time:</span>
                  <p className="font-medium text-slate-800">
                    {new Date(movement.movement_time).toLocaleString()}
                  </p>
                </div>
                {movement.operator && (
                  <div>
                    <span className="text-slate-500">Operator:</span>
                    <p className="font-medium text-slate-800">{movement.operator.full_name}</p>
                  </div>
                )}
              </div>

              {movement.notes && (
                <p className="mt-3 text-sm text-slate-600 italic">{movement.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
