import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar,
  Users,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Hackathon } from '../../types';
import axiosClient from '../../api/axiosClient';

// Status badge styles
const statusStyles: Record<string, string> = {
  upcoming: 'badge-info',
  registration: 'badge-warning',
  active: 'badge-success',
  completed: 'badge-ghost',
};

const statusLabels: Record<string, string> = {
  upcoming: 'Скоро',
  registration: 'Регистрация',
  active: 'Активен',
  completed: 'Завершён',
};

/**
 * HackathonManager - Управление хакатонами (Admin)
 */
export function HackathonManager() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    minTeamSize: 2,
    maxTeamSize: 5,
  });

  // Fetch hackathons from API
  const fetchHackathons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosClient.get('/api/hackathons');
      
      // Transform backend response to frontend Hackathon type
      const transformedHackathons: Hackathon[] = (response.data || []).map((h: any) => ({
        id: String(h.id),
        name: h.name || '',
        description: h.description || '',
        imageUrl: h.imageUrl,
        startDate: new Date(h.startDate),
        endDate: new Date(h.endDate),
        registrationDeadline: new Date(h.registrationDeadline || h.endDate),
        maxTeamSize: h.teamSize || h.maxTeamSize || 5,
        minTeamSize: h.minTeamSize || 2,
        status: mapBackendStatus(h.status),
        participantsCount: h.participantsCount || 0,
        teamsCount: h.teamsCount || 0,
        createdAt: new Date(h.createdAt),
      }));
      
      setHackathons(transformedHackathons);
    } catch (err: any) {
      console.error('Failed to fetch hackathons:', err);
      setError(err.response?.data?.error || 'Не удалось загрузить хакатоны');
    } finally {
      setIsLoading(false);
    }
  };

  // Map backend status to frontend status
  const mapBackendStatus = (status: string): Hackathon['status'] => {
    switch (status) {
      case 'registration_open':
        return 'registration';
      case 'active':
      case 'in_progress':
        return 'active';
      case 'completed':
      case 'finished':
        return 'completed';
      default:
        return 'upcoming';
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  // Filter hackathons
  const filteredHackathons = hackathons.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open modal for new hackathon
  const openNewModal = () => {
    setEditingHackathon(null);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      minTeamSize: 2,
      maxTeamSize: 5,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (hackathon: Hackathon) => {
    setEditingHackathon(hackathon);
    setFormData({
      name: hackathon.name,
      description: hackathon.description,
      startDate: hackathon.startDate.toISOString().split('T')[0],
      endDate: hackathon.endDate.toISOString().split('T')[0],
      registrationDeadline: hackathon.registrationDeadline.toISOString().split('T')[0],
      minTeamSize: hackathon.minTeamSize,
      maxTeamSize: hackathon.maxTeamSize,
    });
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingHackathon) {
        // Update existing via API
        await axiosClient.put(`/admin/api/hackathons/${editingHackathon.id}`, {
          name: formData.name,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          registrationDeadline: formData.registrationDeadline,
          minTeamSize: formData.minTeamSize,
          maxTeamSize: formData.maxTeamSize,
        });
      } else {
        // Create new via API
        await axiosClient.post('/admin/api/hackathons', {
          name: formData.name,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          registrationDeadline: formData.registrationDeadline,
          teamSize: formData.maxTeamSize,
          maxTeams: 100,
        });
      }
      
      // Refresh list
      await fetchHackathons();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save hackathon:', err);
      alert(err.response?.data?.error || 'Не удалось сохранить хакатон');
    }
  };

  // Delete hackathon
  const handleDelete = async (id: string) => {
    if (confirm('Удалить хакатон?')) {
      try {
        await axiosClient.delete(`/admin/api/hackathons/${id}`);
        await fetchHackathons();
      } catch (err: any) {
        console.error('Failed to delete hackathon:', err);
        alert(err.response?.data?.error || 'Не удалось удалить хакатон');
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-error" />
        <p className="text-error">{error}</p>
        <button className="btn btn-primary" onClick={fetchHackathons}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Хакатоны</h1>
          <p className="text-base-content/60">Управление хакатонами платформы</p>
        </div>
        <button className="btn btn-primary" onClick={openNewModal}>
          <Plus className="w-4 h-4" />
          Добавить хакатон
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center bg-base-200 p-4 rounded-lg">
        <div className="form-control flex-1">
          <div className="input-group">
            <span className="bg-base-300">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Поиск по названию..."
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <select 
          className="select select-bordered w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Все статусы</option>
          <option value="upcoming">Скоро</option>
          <option value="registration">Регистрация</option>
          <option value="active">Активные</option>
          <option value="completed">Завершённые</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-primary">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="stat-title">Всего</div>
          <div className="stat-value text-primary">{hackathons.length}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-success">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="stat-title">Активных</div>
          <div className="stat-value text-success">
            {hackathons.filter(h => h.status === 'active').length}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-warning">
            <Clock className="w-8 h-8" />
          </div>
          <div className="stat-title">Регистрация</div>
          <div className="stat-value text-warning">
            {hackathons.filter(h => h.status === 'registration').length}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-info">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title">Участников</div>
          <div className="stat-value text-info">
            {hackathons.reduce((sum, h) => sum + h.participantsCount, 0)}
          </div>
        </div>
      </div>

      {/* Hackathons Table */}
      <div className="bg-base-200 rounded-lg overflow-hidden">
        <table className="table table-zebra">
          <thead>
            <tr className="bg-base-300">
              <th>Название</th>
              <th>Даты</th>
              <th>Участники</th>
              <th>Команды</th>
              <th>Статус</th>
              <th className="w-20">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredHackathons.map(hackathon => (
              <tr key={hackathon.id} className="hover">
                <td>
                  <div className="font-semibold">{hackathon.name}</div>
                  <div className="text-sm text-base-content/60 line-clamp-1">
                    {hackathon.description}
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    {hackathon.startDate.toLocaleDateString('ru-RU')} - {hackathon.endDate.toLocaleDateString('ru-RU')}
                  </div>
                  <div className="text-xs text-base-content/60">
                    Дедлайн: {hackathon.registrationDeadline.toLocaleDateString('ru-RU')}
                  </div>
                </td>
                <td>
                  <span className="font-semibold">{hackathon.participantsCount}</span>
                </td>
                <td>
                  <span className="font-semibold">{hackathon.teamsCount}</span>
                </td>
                <td>
                  <span className={`badge ${statusStyles[hackathon.status]}`}>
                    {statusLabels[hackathon.status]}
                  </span>
                </td>
                <td>
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-sm btn-square">
                      <MoreVertical className="w-4 h-4" />
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-40">
                      <li>
                        <button>
                          <Eye className="w-4 h-4" />
                          Просмотр
                        </button>
                      </li>
                      <li>
                        <button onClick={() => openEditModal(hackathon)}>
                          <Edit2 className="w-4 h-4" />
                          Редактировать
                        </button>
                      </li>
                      <li>
                        <button 
                          className="text-error"
                          onClick={() => handleDelete(hackathon.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Удалить
                        </button>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredHackathons.length === 0 && (
          <div className="p-8 text-center text-base-content/60">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Хакатоны не найдены</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="font-bold text-lg mb-4">
              {editingHackathon ? 'Редактировать хакатон' : 'Новый хакатон'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Название</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Описание</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Начало</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Окончание</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Дедлайн регистрации</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Мин. размер команды</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    min={1}
                    max={10}
                    value={formData.minTeamSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, minTeamSize: +e.target.value }))}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Макс. размер команды</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    min={1}
                    max={10}
                    value={formData.maxTeamSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTeamSize: +e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingHackathon ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsModalOpen(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
