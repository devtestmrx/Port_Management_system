import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { FileText, Clock } from 'lucide-react';

type AuditLog = Database['public']['Tables']['audit_log']['Row'];

interface AuditLogWithUser extends AuditLog {
  user?: {
    full_name: string;
    email: string;
  };
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadAuditLogs();
  }, [filter]);

  const loadAuditLogs = async () => {
    try {
      let query = supabase
        .from('audit_log')
        .select(`
          *,
          user:user_id(full_name, email)
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('table_name', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data as AuditLogWithUser[]);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'INSERT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-slate-600">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Audit Log</h2>
        </div>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Tables</option>
            <option value="goods_landing">Goods Landing</option>
            <option value="goods_placement">Goods Placement</option>
            <option value="movements">Movements</option>
            <option value="zones">Zones</option>
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="text-center text-slate-600 py-8">No audit logs found</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getOperationColor(log.operation)}`}>
                      {log.operation}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{log.table_name}</span>
                  </div>
                  <p className="text-xs text-slate-600">Record ID: {log.record_id.substring(0, 8)}...</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-4 h-4" />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>

              {log.user && (
                <p className="text-sm text-slate-700 mb-2">
                  User: <span className="font-medium">{log.user.full_name}</span> ({log.user.email})
                </p>
              )}

              {log.ip_address && (
                <p className="text-xs text-slate-500">IP: {log.ip_address}</p>
              )}

              {(log.old_data || log.new_data) && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium text-slate-700 hover:text-blue-600">
                      View Data Changes
                    </summary>
                    <div className="mt-2 space-y-2">
                      {log.old_data && (
                        <div>
                          <p className="font-medium text-slate-600 mb-1">Old Data:</p>
                          <pre className="text-slate-700 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                            {JSON.stringify(log.old_data, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.new_data && (
                        <div>
                          <p className="font-medium text-slate-600 mb-1">New Data:</p>
                          <pre className="text-slate-700 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                            {JSON.stringify(log.new_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
