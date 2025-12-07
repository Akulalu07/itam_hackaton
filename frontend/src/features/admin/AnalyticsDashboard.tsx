import { useState, useEffect } from 'react';
import { 
  Users, 
  UsersRound, 
  Trophy, 
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

interface AdminStats {
  totalUsers: number;
  totalTeams: number;
  totalHackathons: number;
  activeHackathons: number;
  usersLookingForTeam: number;
  usersInTeam: number;
}

/**
 * AnalyticsDashboard - Аналитика платформы (Admin)
 */
export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTeams: 0,
    totalHackathons: 0,
    activeHackathons: 0,
    usersLookingForTeam: 0,
    usersInTeam: 0,
  });

  // Загрузка статистики с бэкенда
  const fetchStats = async () => {
    try {
      setError(null);
      const response = await axiosClient.get('/api/admin/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError('Не удалось загрузить статистику');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
  };

  // Export CSV
  const exportCSV = () => {
    const csvContent = `Метрика,Значение
Всего пользователей,${stats.totalUsers}
Всего команд,${stats.totalTeams}
Всего хакатонов,${stats.totalHackathons}
Активных хакатонов,${stats.activeHackathons}
Ищут команду,${stats.usersLookingForTeam}
В команде,${stats.usersInTeam}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
        <button className="btn btn-sm btn-ghost" onClick={handleRefresh}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Аналитика</h1>
          <p className="text-base-content/60">Обзор ключевых метрик платформы</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="select select-bordered select-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          >
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="year">За год</option>
          </select>
          <button 
            className={`btn btn-ghost btn-sm ${isRefreshing ? 'loading' : ''}`}
            onClick={handleRefresh}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportCSV}>
            <Download className="w-4 h-4" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title">Пользователей</div>
          <div className="stat-value text-primary">{stats.totalUsers}</div>
          <div className="stat-desc">
            {stats.usersLookingForTeam} ищут команду
          </div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-secondary">
            <UsersRound className="w-8 h-8" />
          </div>
          <div className="stat-title">Команд</div>
          <div className="stat-value text-secondary">{stats.totalTeams}</div>
          <div className="stat-desc">
            {stats.usersInTeam} участников в командах
          </div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-accent">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="stat-title">Хакатонов</div>
          <div className="stat-value text-accent">{stats.totalHackathons}</div>
          <div className="stat-desc">
            {stats.activeHackathons} активных
          </div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-info">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="stat-title">Активность</div>
          <div className="stat-value text-info">
            {stats.totalUsers > 0 
              ? Math.round((stats.usersInTeam / stats.totalUsers) * 100) 
              : 0}%
          </div>
          <div className="stat-desc">
            Участников в командах
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="bg-base-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Сводка по платформе
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Всего пользователей</span>
              <span className="font-semibold text-lg">{stats.totalUsers}</span>
            </div>
            <div className="divider my-0" />
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Ищут команду</span>
              <span className="font-semibold text-lg text-warning">{stats.usersLookingForTeam}</span>
            </div>
            <div className="divider my-0" />
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">В командах</span>
              <span className="font-semibold text-lg text-success">{stats.usersInTeam}</span>
            </div>
            <div className="divider my-0" />
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Всего команд</span>
              <span className="font-semibold text-lg">{stats.totalTeams}</span>
            </div>
            <div className="divider my-0" />
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Хакатонов</span>
              <span className="font-semibold text-lg">{stats.totalHackathons}</span>
            </div>
            <div className="divider my-0" />
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Активных хакатонов</span>
              <span className="font-semibold text-lg text-primary">{stats.activeHackathons}</span>
            </div>
          </div>
        </div>

        {/* Activity Rate */}
        <div className="bg-base-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Процент активности</h3>
          
          <div className="flex flex-col items-center justify-center h-48">
            <div className="radial-progress text-primary" 
              style={{ 
                '--value': stats.totalUsers > 0 
                  ? Math.round((stats.usersInTeam / stats.totalUsers) * 100) 
                  : 0,
                '--size': '12rem',
                '--thickness': '1rem'
              } as React.CSSProperties}
              role="progressbar"
            >
              <span className="text-3xl font-bold">
                {stats.totalUsers > 0 
                  ? Math.round((stats.usersInTeam / stats.totalUsers) * 100) 
                  : 0}%
              </span>
            </div>
            <p className="text-base-content/60 mt-4 text-center">
              Участников нашли команду
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="alert alert-info">
        <AlertCircle className="w-5 h-5" />
        <span>
          Данные обновляются в реальном времени из базы данных. 
          Нажмите кнопку "Обновить" для получения актуальной статистики.
        </span>
      </div>
    </div>
  );
}
