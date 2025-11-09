import { Ship } from '../../types/ships';
import { formatCargoType, formatStatus, getStatusColor, formatDateTimeDisplay } from '../../utils/shipUtils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ShipsTableProps {
  ships: Ship[];
  sortBy: 'arrival_date';
  sortOrder: 'asc' | 'desc';
  onSort: (order: 'asc' | 'desc') => void;
}

export function ShipsTable({ ships, sortOrder, onSort }: ShipsTableProps) {
  const handleSortToggle = () => {
    onSort(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (ships.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-slate-600 text-lg">No ships found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                Ship Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                Cargo Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                <button
                  onClick={handleSortToggle}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  aria-label="Sort by arrival date"
                >
                  Arrival Date
                  {sortOrder === 'asc' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800">
                Expected Arrival
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {ships.map((ship) => (
              <tr key={ship.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                  {ship.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatCargoType(ship.cargo_type)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatDateTimeDisplay(ship.arrival_date)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      ship.status
                    )}`}
                  >
                    {formatStatus(ship.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {ship.is_expected_arrival ? (
                    <>
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-2">
                        Expected
                      </span>
                      {ship.expected_arrival_time && (
                        <span className="text-slate-600">
                          {formatDateTimeDisplay(ship.expected_arrival_time)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-500">Already arrived</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
