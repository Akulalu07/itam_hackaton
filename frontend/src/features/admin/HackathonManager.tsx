import { useState, useEffect, useRef } from 'react';
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
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { Hackathon } from '../../types';
import axiosClient from '../../api/axiosClient';
import { ImageCropper } from '../../components/common/ImageCropper';

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
    imageUrl: '',
    openRegistration: true, // По умолчанию открываем регистрацию
  });
  
  // Image upload state
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

  // Close modal and reset state
  const closeModal = () => {
    setIsModalOpen(false);
    setShowCropper(false);
    setTempImageUrl(null);
  };

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
      imageUrl: '',
      openRegistration: true,
    });
    setValidationErrors([]);
    setShowCropper(false);
    setTempImageUrl(null);
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
      imageUrl: hackathon.imageUrl || '',
      openRegistration: hackathon.status === 'registration',
    });
    setValidationErrors([]);
    setShowCropper(false);
    setTempImageUrl(null);
    setIsModalOpen(true);
  };

  // Validate dates
  const validateDates = (): string[] => {
    const errors: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const regDeadline = new Date(formData.registrationDeadline);
    
    // Проверка: начало не раньше чем завтра
    const minStartDate = new Date(today);
    minStartDate.setDate(minStartDate.getDate() + 1);
    
    if (startDate < minStartDate) {
      errors.push('Хакатон должен начинаться минимум завтра');
    }
    
    if (endDate <= startDate) {
      errors.push('Дата окончания должна быть позже даты начала');
    }
    
    if (regDeadline >= startDate) {
      errors.push('Дедлайн регистрации должен быть до начала хакатона');
    }
    
    if (regDeadline < today) {
      errors.push('Дедлайн регистрации не может быть в прошлом');
    }
    
    return errors;
  };

  // Handle image file select
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Размер файла не должен превышать 10MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setTempImageUrl(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle cropped image
  const handleCroppedImage = (croppedImageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl: croppedImageUrl }));
    setShowCropper(false);
    setTempImageUrl(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    const dateErrors = validateDates();
    if (dateErrors.length > 0) {
      setValidationErrors(dateErrors);
      return;
    }
    setValidationErrors([]);
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        registrationDeadline: formData.registrationDeadline,
        minTeamSize: formData.minTeamSize,
        maxTeamSize: formData.maxTeamSize,
        imageUrl: formData.imageUrl, // Base64 or URL
        status: formData.openRegistration ? 'registration_open' : 'draft',
      };

      if (editingHackathon) {
        // Update existing via API
        await axiosClient.put(`/api/admin/hackathons/${editingHackathon.id}`, payload);
      } else {
        // Create new via API
        await axiosClient.post('/api/admin/hackathons', {
          ...payload,
          teamSize: formData.maxTeamSize,
          maxTeams: 100,
        });
      }
      
      // Refresh list
      await fetchHackathons();
      closeModal();
    } catch (err: any) {
      console.error('Failed to save hackathon:', err);
      setValidationErrors([err.response?.data?.error || 'Не удалось сохранить хакатон']);
    }
  };

  // Delete hackathon
  const handleDelete = async (id: string) => {
    if (confirm('Удалить хакатон?')) {
      try {
        await axiosClient.delete(`/api/admin/hackathons/${id}`);
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
                  <div className="flex items-center gap-3">
                    {hackathon.imageUrl ? (
                      <img 
                        src={hackathon.imageUrl} 
                        alt={hackathon.name}
                        className="w-16 h-9 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-9 bg-base-200 rounded flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-base-content/30" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{hackathon.name}</div>
                      <div className="text-sm text-base-content/60 line-clamp-1">
                        {hackathon.description}
                      </div>
                    </div>
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
              onClick={closeModal}
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="font-bold text-lg mb-4">
              {editingHackathon ? 'Редактировать хакатон' : 'Новый хакатон'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Validation errors */}
              {validationErrors.length > 0 && (
                <div className="alert alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    {validationErrors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Image upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Обложка хакатона</span>
                </label>
                <div className="flex items-start gap-4">
                  <div 
                    className="relative w-48 h-28 bg-base-200 rounded-lg overflow-hidden border-2 border-dashed border-base-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.imageUrl ? (
                      <>
                        <img 
                          src={formData.imageUrl} 
                          alt="Обложка" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 btn btn-circle btn-xs btn-error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, imageUrl: '' }));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2">
                        <ImageIcon className="w-8 h-8 mx-auto text-base-content/40" />
                        <p className="text-xs text-base-content/60 mt-1">Нажмите для загрузки</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <div className="text-sm text-base-content/60">
                    <p>Рекомендуемый размер: 800×450</p>
                    <p>Формат: JPG, PNG</p>
                    <p>Макс. размер: 10MB</p>
                  </div>
                </div>
              </div>

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

              {/* Registration status toggle */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={formData.openRegistration}
                    onChange={(e) => setFormData(prev => ({ ...prev, openRegistration: e.target.checked }))}
                  />
                  <span className="label-text">Открыть регистрацию сразу</span>
                </label>
                <span className="text-sm text-base-content/60 ml-1">
                  {formData.openRegistration 
                    ? 'Участники смогут регистрироваться на хакатон сразу после создания' 
                    : 'Хакатон будет создан как черновик, регистрацию нужно будет открыть отдельно'}
                </span>
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={closeModal}
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
            <button onClick={closeModal}>close</button>
          </form>
        </dialog>
      )}

      {/* Image Cropper Modal */}
      {showCropper && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCrop={handleCroppedImage}
          onCancel={() => {
            setShowCropper(false);
            setTempImageUrl(null);
          }}
          aspectRatio={16 / 9}
        />
      )}
    </div>
  );
}
