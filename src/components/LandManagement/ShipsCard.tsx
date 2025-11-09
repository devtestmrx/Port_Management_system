import { Ship } from '../../types/ships';
import { formatCargoType, formatStatus, getStatusColor, formatDateTimeDisplay } from '../../utils/shipUtils';
import { Ship as ShipIcon } from 'lucide-react';

interface ShipsCardProps {
  ship: Ship;
}

export function ShipsCard({ ship }: ShipsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <ShipIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-800 break-words">
              {ship.name}
            </h3>
            <p className="text-sm text-slate-600">
              {formatCargoType(ship.cargo_type)}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${getStatusColor(
            ship.status
          )}`}
        >
          {formatStatus(ship.status)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500 mb-1">Arrival Date/Time</p>
          <p className="text-sm font-medium text-slate-800">
            {formatDateTimeDisplay(ship.arrival_date)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1">Expected Arrival</p>
          {ship.is_expected_arrival ? (
            <div className="space-y-1">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                Expected
              </span>
              {ship.expected_arrival_time && (
                <p className="text-sm text-slate-700 mt-1">
                  {formatDateTimeDisplay(ship.expected_arrival_time)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">Already arrived</p>
          )}
        </div>
      </div>
    </div>
  );
}
