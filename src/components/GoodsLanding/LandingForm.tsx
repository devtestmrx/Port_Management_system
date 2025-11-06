import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Package, AlertCircle, CheckCircle } from 'lucide-react';
import { Database } from '../../lib/database.types';

type TransportMode = Database['public']['Tables']['goods_landing']['Row']['transport_mode'];
type UnitType = Database['public']['Tables']['goods_landing']['Row']['unit_type'];

export function LandingForm({ onSuccess }: { onSuccess?: () => void }) {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    goods_id: '',
    origin: '',
    transport_mode: 'ship' as TransportMode,
    quantity: '',
    unit_type: 'container' as UnitType,
    goods_type: '',
    vessel_name: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('goods_landing')
        .insert({
          goods_id: formData.goods_id,
          origin: formData.origin,
          transport_mode: formData.transport_mode,
          quantity: parseFloat(formData.quantity),
          unit_type: formData.unit_type,
          goods_type: formData.goods_type,
          vessel_name: formData.vessel_name,
          notes: formData.notes,
          landing_clerk_id: profile?.id || null,
          status: 'landed',
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        goods_id: '',
        origin: '',
        transport_mode: 'ship',
        quantity: '',
        unit_type: 'container',
        goods_type: '',
        vessel_name: '',
        notes: '',
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register goods landing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">Register Goods Landing</h2>
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
            <p className="text-sm text-green-800">Goods landing registered successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="goods_id" className="block text-sm font-medium text-slate-700 mb-2">
              Goods ID / Container Number *
            </label>
            <input
              id="goods_id"
              type="text"
              value={formData.goods_id}
              onChange={(e) => setFormData({ ...formData, goods_id: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CONT123456"
              required
            />
          </div>

          <div>
            <label htmlFor="vessel_name" className="block text-sm font-medium text-slate-700 mb-2">
              Vessel / Truck Name *
            </label>
            <input
              id="vessel_name"
              type="text"
              value={formData.vessel_name}
              onChange={(e) => setFormData({ ...formData, vessel_name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., MV OCEAN STAR"
              required
            />
          </div>

          <div>
            <label htmlFor="origin" className="block text-sm font-medium text-slate-700 mb-2">
              Origin *
            </label>
            <input
              id="origin"
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Shanghai Port"
              required
            />
          </div>

          <div>
            <label htmlFor="transport_mode" className="block text-sm font-medium text-slate-700 mb-2">
              Transport Mode *
            </label>
            <select
              id="transport_mode"
              value={formData.transport_mode}
              onChange={(e) => setFormData({ ...formData, transport_mode: e.target.value as TransportMode })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="ship">Ship</option>
              <option value="truck">Truck</option>
              <option value="rail">Rail</option>
              <option value="air">Air</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
              Quantity *
            </label>
            <input
              id="quantity"
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 50"
              required
            />
          </div>

          <div>
            <label htmlFor="unit_type" className="block text-sm font-medium text-slate-700 mb-2">
              Unit Type *
            </label>
            <select
              id="unit_type"
              value={formData.unit_type}
              onChange={(e) => setFormData({ ...formData, unit_type: e.target.value as UnitType })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="container">Container</option>
              <option value="pallet">Pallet</option>
              <option value="ton">Ton</option>
              <option value="cubic_meter">Cubic Meter</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="goods_type" className="block text-sm font-medium text-slate-700 mb-2">
              Goods Type *
            </label>
            <input
              id="goods_type"
              type="text"
              value={formData.goods_type}
              onChange={(e) => setFormData({ ...formData, goods_type: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Electronics, Food, Machinery"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Additional information..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Registering...' : 'Register Landing'}
        </button>
      </form>
    </div>
  );
}
