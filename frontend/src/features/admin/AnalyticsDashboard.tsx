import { useState } from 'react';
import { 
  Users, 
  UsersRound, 
  Trophy, 
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { mockUsers, mockTeams, mockHackathons } from '../../data/mockData';

/**
 * AnalyticsDashboard - Аналитика платформы (Admin)
 */
export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock statistics
  const stats = {
    totalUsers: mockUsers.length,
    totalTeams: mockTeams.length,
    totalHackathons: mockHackathons.length,
    activeHackathons: mockHackathons.filter(h => h.status === 'active').length,
    avgTeamSize: 3.5,
    matchRate: 78,
    userGrowth: 12.5,
    teamGrowth: 8.3,
  };

  // Mock chart data
  const chartData = [
    { label: 'Пн', users: 45, teams: 12 },
    { label: 'Вт', users: 52, teams: 15 },
    { label: 'Ср', users: 48, teams: 14 },
    { label: 'Чт', users: 70, teams: 22 },
    { label: 'Пт', users: 85, teams: 28 },
    { label: 'Сб', users: 65, teams: 20 },
    { label: 'Вс', users: 40, teams: 10 },
  ];

  const maxValue = Math.max(...chartData.map(d => Math.max(d.users, d.teams)));

  // Skills distribution
  const skillsDistribution = [
    { name: 'Frontend', count: 45, color: 'bg-primary' },
    { name: 'Backend', count: 38, color: 'bg-secondary' },
    { name: 'Design', count: 25, color: 'bg-accent' },
    { name: 'ML/AI', count: 18, color: 'bg-info' },
    { name: 'DevOps', count: 12, color: 'bg-warning' },
    { name: 'Management', count: 8, color: 'bg-error' },
  ];

  const totalSkills = skillsDistribution.reduce((sum, s) => sum + s.count, 0);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Export CSV
  const exportCSV = () => {
    const csvContent = `Метрика,Значение
Всего пользователей,${stats.totalUsers}
Всего команд,${stats.totalTeams}
Всего хакатонов,${stats.totalHackathons}
Активных хакатонов,${stats.activeHackathons}
Средний размер команды,${stats.avgTeamSize}
Рейтинг мэтчинга,${stats.matchRate}%`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

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
      <div className="grid grid-cols-4 gap-4">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title">Пользователей</div>
          <div className="stat-value text-primary">{stats.totalUsers}</div>
          <div className="stat-desc flex items-center gap-1 text-success">
            <ArrowUpRight className="w-4 h-4" />
            +{stats.userGrowth}% за период
          </div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-secondary">
            <UsersRound className="w-8 h-8" />
          </div>
          <div className="stat-title">Команд</div>
          <div className="stat-value text-secondary">{stats.totalTeams}</div>
          <div className="stat-desc flex items-center gap-1 text-success">
            <ArrowUpRight className="w-4 h-4" />
            +{stats.teamGrowth}% за период
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
          <div className="stat-title">Мэтч-рейт</div>
          <div className="stat-value text-info">{stats.matchRate}%</div>
          <div className="stat-desc">
            Успешных совпадений
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-base-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Активность за неделю
          </h3>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-2">
            {chartData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end h-40">
                  {/* Users bar */}
                  <div 
                    className="flex-1 bg-primary rounded-t transition-all hover:opacity-80"
                    style={{ height: `${(day.users / maxValue) * 100}%` }}
                    title={`Пользователи: ${day.users}`}
                  />
                  {/* Teams bar */}
                  <div 
                    className="flex-1 bg-secondary rounded-t transition-all hover:opacity-80"
                    style={{ height: `${(day.teams / maxValue) * 100}%` }}
                    title={`Команды: ${day.teams}`}
                  />
                </div>
                <span className="text-xs text-base-content/60">{day.label}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded" />
              <span className="text-sm">Пользователи</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded" />
              <span className="text-sm">Команды</span>
            </div>
          </div>
        </div>

        {/* Skills Distribution */}
        <div className="bg-base-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Распределение навыков</h3>
          
          <div className="space-y-4">
            {skillsDistribution.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{skill.name}</span>
                  <span className="text-base-content/60">
                    {skill.count} ({Math.round((skill.count / totalSkills) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div 
                    className={`${skill.color} h-2 rounded-full transition-all`}
                    style={{ width: `${(skill.count / totalSkills) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-base-200 rounded-lg p-6 col-span-2">
          <h3 className="font-semibold mb-4">Последняя активность</h3>
          <div className="space-y-3">
            {[
              { action: 'Новая регистрация', user: 'Алексей П.', time: '5 мин назад', type: 'user' },
              { action: 'Создана команда', user: 'Code Warriors', time: '12 мин назад', type: 'team' },
              { action: 'Приглашение принято', user: 'Мария И.', time: '25 мин назад', type: 'invite' },
              { action: 'Новый хакатон', user: 'AI Challenge 2025', time: '1 час назад', type: 'hackathon' },
              { action: 'Команда сформирована', user: 'Debug Masters', time: '2 часа назад', type: 'team' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-base-300/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-primary' :
                    activity.type === 'team' ? 'bg-secondary' :
                    activity.type === 'invite' ? 'bg-success' : 'bg-accent'
                  }`} />
                  <div>
                    <span className="font-medium">{activity.action}</span>
                    <span className="text-base-content/60"> — {activity.user}</span>
                  </div>
                </div>
                <span className="text-xs text-base-content/50">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-base-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Быстрая статистика</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Средний размер команды</span>
              <span className="font-semibold">{stats.avgTeamSize}</span>
            </div>
            <div className="divider my-0" />
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Пользователей без команды</span>
              <span className="font-semibold">{mockUsers.filter(u => u.status === 'looking').length}</span>
            </div>
            <div className="divider my-0" />
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Капитанов</span>
              <span className="font-semibold">{mockUsers.filter(u => u.role === 'captain').length}</span>
            </div>
            <div className="divider my-0" />
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Неполных команд</span>
              <span className="font-semibold">{mockTeams.filter(t => t.members.length < t.maxSize).length}</span>
            </div>
            <div className="divider my-0" />
            <div className="flex justify-between items-center">
              <span className="text-base-content/70">Приглашений сегодня</span>
              <span className="font-semibold">24</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
