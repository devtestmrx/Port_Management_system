import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { Database } from '../../lib/database.types';

type Zone = Database['public']['Tables']['zones']['Row'];
type GoodsLanding = Database['public']['Tables']['goods_landing']['Row'];

interface ZoneSuggestion extends Zone {
  availableCapacity: number;
  utilizationPercent: number;
  score: number;
}

export function PlacementForm({ onSuccess }: { onSuccess?: () => void }) {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [unplacedGoods, setUnplacedGoods] = useState<GoodsLanding[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [suggestions, setSuggestions] = useState<ZoneSuggestion[]>([]);

  const [formData, setFormData] = useState({
    goods_landing_id: '',
    zone_id: '',
    rack_number: '',
    notes: '',
  });

  useEffect(() => {
    loadUnplacedGoods();
    loadZones();
  }, []);

  useEffect(() => {
    if (formData.goods_landing_id) {
      const selectedGoods = unplacedGoods.find(g => g.id === formData.goods_landing_id);
      if (selectedGoods) {
        generateSuggestions(selectedGoods);
      }
    } else {
      setSuggestions([]);
    }
  }, [formData.goods_landing_id, zones]);

  const loadUnplacedGoods = async () => {
    try {
      const { data, error } = await supabase
        .from('goods_landing')
        .select('*')
        .eq('status', 'landed')
        .order('arrival_time', { ascending: true });

      if (error) throw error;
      setUnplacedGoods(data || []);
    } catch (error) {
      console.error('Error loading unplaced goods:', error);
    }
  };

  const loadZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('status', 'active')
        .order('zone_code');

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const generateSuggestions = (goods: GoodsLanding) => {
    const zoneSuggestions: ZoneSuggestion[] = zones
      .map(zone => {
        const availableCapacity = zone.capacity - zone.current_occupancy;
        const utilizationPercent = (zone.current_occupancy / zone.capacity) * 100;

        let score = 0;

        if (availableCapacity >= goods.quantity) {
          score += 50;
        } else {
          return null;
        }

        if (utilizationPercent < 70) {
          score += 30;
        } else if (utilizationPercent < 85) {
          score += 20;
        } else {
          score += 10;
        }

        const goodsTypeLower = goods.goods_type.toLowerCase();
        if (
          (goodsTypeLower.includes('refrigerat') || goodsTypeLower.includes('frozen') || goodsTypeLower.includes('cold')) &&
          zone.zone_type === 'refrigerated'
        ) {
          score += 20;
        } else if (
          goods.unit_type === 'container' && zone.zone_type === 'container'
        ) {
          score += 15;
        } else if (
          (goods.unit_type === 'ton' || goods.unit_type === 'cubic_meter') &&
          zone.zone_type === 'bulk'
        ) {
          score += 15;
        } else if (zone.zone_type === 'general') {
          score += 5;
        }

        return {
          ...zone,
          availableCapacity,
          utilizationPercent,
          score,
        };
      })
      .filter((s): s is ZoneSuggestion => s !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setSuggestions(zoneSuggestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const selectedGoods = unplacedGoods.find(g => g.id === formData.goods_landing_id);
      const selectedZone = zones.find(z => z.id === formData.zone_id);

      if (!selectedGoods || !selectedZone) {
        throw new Error('Invalid goods or zone selection');
      }

      if (selectedZone.capacity - selectedZone.current_occupancy < selectedGoods.quantity) {
        throw new Error('Insufficient capacity in selected zone');
      }

      const { error: placementError } = await supabase
        .from('goods_placement')
        .insert({
          goods_landing_id: formData.goods_landing_id,
          zone_id: formData.zone_id,
          rack_number: formData.rack_number,
          operator_id: profile?.id || null,
          placement_type: 'initial',
          status: 'active',
          notes: formData.notes,
        });

      if (placementError) throw placementError;

      const { error: updateGoodsError } = await supabase
        .from('goods_landing')
        .update({ status: 'placed' })
        .eq('id', formData.goods_landing_id);

      if (updateGoodsError) throw updateGoodsError;

      const { error: updateZoneError } = await supabase
        .from('zones')
        .update({
          current_occupancy: selectedZone.current_occupancy + selectedGoods.quantity
        })
        .eq('id', formData.zone_id);

      if (updateZoneError) throw updateZoneError;

      setSuccess(true);
      setFormData({
        goods_landing_id: '',
        zone_id: '',
        rack_number: '',
        notes: '',
      });
      setSuggestions([]);
      loadUnplacedGoods();
      loadZones();

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place goods');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">Place Goods in Zone</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">Goods placed successfully!</p>
          </div>
        )}

        <div>
          <label htmlFor="goods_landing_id" className="block text-sm font-medium text-slate-700 mb-2">
            Select Goods to Place *
          </label>
          <select
            id="goods_landing_id"
            value={formData.goods_landing_id}
            onChange={(e) => setFormData({ ...formData, goods_landing_id: e.target.value, zone_id: '' })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">-- Select goods --</option>
            {unplacedGoods.map((goods) => (
              <option key={goods.id} value={goods.id}>
                {goods.goods_id} - {goods.goods_type} ({goods.quantity} {goods.unit_type})
              </option>
            ))}
          </select>
          {unplacedGoods.length === 0 && (
            <p className="text-sm text-slate-500 mt-1">No unplaced goods available</p>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Suggested Zones</h3>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, zone_id: suggestion.id })}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    formData.zone_id === suggestion.id
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-blue-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800">
                      {index === 0 && '🥇 '}
                      {index === 1 && '🥈 '}
                      {index === 2 && '🥉 '}
                      {suggestion.zone_code} - {suggestion.description}
                    </span>
                    <span className="text-sm text-slate-600">
                      {suggestion.utilizationPercent.toFixed(0)}% full
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Type: {suggestion.zone_type} | Available: {suggestion.availableCapacity.toFixed(0)} units
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="zone_id" className="block text-sm font-medium text-slate-700 mb-2">
            Zone *
          </label>
          <select
            id="zone_id"
            value={formData.zone_id}
            onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">-- Select zone --</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.zone_code} - {zone.description} (Available: {zone.capacity - zone.current_occupancy})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rack_number" className="block text-sm font-medium text-slate-700 mb-2">
            Rack / Slot Number *
          </label>
          <input
            id="rack_number"
            type="text"
            value={formData.rack_number}
            onChange={(e) => setFormData({ ...formData, rack_number: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., R1-S5"
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Additional placement information..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || unplacedGoods.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Placing...' : 'Place Goods'}
        </button>
      </form>
    </div>
  );
}
