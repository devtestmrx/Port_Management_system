import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TruckIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { Database } from '../../lib/database.types';

type Zone = Database['public']['Tables']['zones']['Row'];

interface PlacedGoods {
  id: string;
  goods_landing_id: string;
  zone_id: string;
  rack_number: string;
  goods_landing: {
    goods_id: string;
    goods_type: string;
    quantity: number;
    unit_type: string;
  };
  zone: {
    zone_code: string;
  };
}

export function MovementForm({ onSuccess }: { onSuccess?: () => void }) {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [placedGoods, setPlacedGoods] = useState<PlacedGoods[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedGoods, setSelectedGoods] = useState<PlacedGoods | null>(null);

  const [formData, setFormData] = useState({
    goods_placement_id: '',
    to_zone_id: '',
    to_rack: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    loadPlacedGoods();
    loadZones();
  }, []);

  useEffect(() => {
    if (formData.goods_placement_id) {
      const goods = placedGoods.find(g => g.id === formData.goods_placement_id);
      setSelectedGoods(goods || null);
    } else {
      setSelectedGoods(null);
    }
  }, [formData.goods_placement_id, placedGoods]);

  const loadPlacedGoods = async () => {
    try {
      const { data, error } = await supabase
        .from('goods_placement')
        .select(`
          id,
          goods_landing_id,
          zone_id,
          rack_number,
          goods_landing:goods_landing_id(goods_id, goods_type, quantity, unit_type),
          zone:zone_id(zone_code)
        `)
        .eq('status', 'active')
        .order('placement_time', { ascending: false });

      if (error) throw error;
      setPlacedGoods(data as PlacedGoods[]);
    } catch (error) {
      console.error('Error loading placed goods:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      if (!selectedGoods) {
        throw new Error('No goods selected');
      }

      const toZone = zones.find(z => z.id === formData.to_zone_id);
      if (!toZone) {
        throw new Error('Invalid destination zone');
      }

      const fromZone = zones.find(z => z.id === selectedGoods.zone_id);
      if (!fromZone) {
        throw new Error('Invalid source zone');
      }

      const goodsQuantity = selectedGoods.goods_landing.quantity;

      if (toZone.capacity - toZone.current_occupancy < goodsQuantity) {
        throw new Error('Insufficient capacity in destination zone');
      }

      const { error: movementError } = await supabase
        .from('movements')
        .insert({
          goods_landing_id: selectedGoods.goods_landing_id,
          from_zone_id: selectedGoods.zone_id,
          to_zone_id: formData.to_zone_id,
          from_rack: selectedGoods.rack_number,
          to_rack: formData.to_rack,
          operator_id: profile?.id || null,
          reason: formData.reason,
          status: 'completed',
          notes: formData.notes,
        });

      if (movementError) throw movementError;

      const { error: updateOldPlacementError } = await supabase
        .from('goods_placement')
        .update({ status: 'moved' })
        .eq('id', formData.goods_placement_id);

      if (updateOldPlacementError) throw updateOldPlacementError;

      const { error: newPlacementError } = await supabase
        .from('goods_placement')
        .insert({
          goods_landing_id: selectedGoods.goods_landing_id,
          zone_id: formData.to_zone_id,
          rack_number: formData.to_rack,
          operator_id: profile?.id || null,
          placement_type: 'relocated',
          status: 'active',
          notes: `Moved from ${selectedGoods.zone.zone_code}. Reason: ${formData.reason}`,
        });

      if (newPlacementError) throw newPlacementError;

      const { error: updateFromZoneError } = await supabase
        .from('zones')
        .update({
          current_occupancy: fromZone.current_occupancy - goodsQuantity
        })
        .eq('id', selectedGoods.zone_id);

      if (updateFromZoneError) throw updateFromZoneError;

      const { error: updateToZoneError } = await supabase
        .from('zones')
        .update({
          current_occupancy: toZone.current_occupancy + goodsQuantity
        })
        .eq('id', formData.to_zone_id);

      if (updateToZoneError) throw updateToZoneError;

      setSuccess(true);
      setFormData({
        goods_placement_id: '',
        to_zone_id: '',
        to_rack: '',
        reason: '',
        notes: '',
      });
      setSelectedGoods(null);
      loadPlacedGoods();
      loadZones();

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move goods');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <TruckIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">Move Goods Between Zones</h2>
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
            <p className="text-sm text-green-800">Goods moved successfully!</p>
          </div>
        )}

        <div>
          <label htmlFor="goods_placement_id" className="block text-sm font-medium text-slate-700 mb-2">
            Select Goods to Move *
          </label>
          <select
            id="goods_placement_id"
            value={formData.goods_placement_id}
            onChange={(e) => setFormData({ ...formData, goods_placement_id: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">-- Select goods --</option>
            {placedGoods.map((goods) => (
              <option key={goods.id} value={goods.id}>
                {goods.goods_landing.goods_id} - Currently in {goods.zone.zone_code} (Rack: {goods.rack_number})
              </option>
            ))}
          </select>
          {placedGoods.length === 0 && (
            <p className="text-sm text-slate-500 mt-1">No placed goods available to move</p>
          )}
        </div>

        {selectedGoods && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Current Location</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p>Zone: {selectedGoods.zone.zone_code}</p>
              <p>Rack: {selectedGoods.rack_number}</p>
              <p>Type: {selectedGoods.goods_landing.goods_type}</p>
              <p>Quantity: {selectedGoods.goods_landing.quantity} {selectedGoods.goods_landing.unit_type}</p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="to_zone_id" className="block text-sm font-medium text-slate-700 mb-2">
            Destination Zone *
          </label>
          <select
            id="to_zone_id"
            value={formData.to_zone_id}
            onChange={(e) => setFormData({ ...formData, to_zone_id: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={!selectedGoods}
          >
            <option value="">-- Select destination zone --</option>
            {zones
              .filter(z => z.id !== selectedGoods?.zone_id)
              .map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.zone_code} - {zone.description} (Available: {zone.capacity - zone.current_occupancy})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="to_rack" className="block text-sm font-medium text-slate-700 mb-2">
            Destination Rack / Slot *
          </label>
          <input
            id="to_rack"
            type="text"
            value={formData.to_rack}
            onChange={(e) => setFormData({ ...formData, to_rack: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., R2-S8"
            required
            disabled={!selectedGoods}
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">
            Reason for Movement *
          </label>
          <select
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={!selectedGoods}
          >
            <option value="">-- Select reason --</option>
            <option value="Optimization">Space Optimization</option>
            <option value="Consolidation">Consolidation</option>
            <option value="Priority Access">Priority Access Required</option>
            <option value="Zone Maintenance">Zone Maintenance</option>
            <option value="Loading Preparation">Loading Preparation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Additional movement information..."
            disabled={!selectedGoods}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedGoods || placedGoods.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Moving...' : 'Move Goods'}
        </button>
      </form>
    </div>
  );
}
