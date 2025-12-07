import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Gift,
  Package,
  Send,
  Check,
  X,
  User as UserIcon,
  Filter,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { User, ProfileCustomization } from '../../types';
import { caseTemplates, getRarityColor, nameColors, avatarFrames, badges } from '../../data/customization/items';
import axiosClient from '../../api/axiosClient';
import { adminService } from '../../api/services';
import { CustomizedName, CustomizedAvatar } from '../../components/profile/CustomizedAvatar';

// Тип шаблона кейса для админки
type CaseTemplate = typeof caseTemplates[number];

interface GiftRecord {
  userId: string;
  userName: string;
  caseId: string;
  caseName: string;
  timestamp: Date;
}

/**
 * CaseDistribution - Админ-панель для выдачи кейсов пользователям
 */
export function CaseDistribution() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedCase, setSelectedCase] = useState<CaseTemplate | null>(null);
  const [giftHistory, setGiftHistory] = useState<GiftRecord[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'looking' | 'in_team'>('all');

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosClient.get('/api/admin/users?page=1&limit=1000');
      
      // Transform backend response to frontend User type
      const transformedUsers: User[] = (response.data?.users || []).map((u: any) => {
        // Transform customization data
        let customization: ProfileCustomization | undefined;
        if (u.customization) {
          const userBadges: typeof badges = [];
          if (u.customization.badge1Id) {
            const badge = badges.find(b => b.id === u.customization.badge1Id);
            if (badge) userBadges.push(badge);
          }
          if (u.customization.badge2Id) {
            const badge = badges.find(b => b.id === u.customization.badge2Id);
            if (badge) userBadges.push(badge);
          }
          if (u.customization.badge3Id) {
            const badge = badges.find(b => b.id === u.customization.badge3Id);
            if (badge) userBadges.push(badge);
          }
          
          customization = {
            nameColor: u.customization.nameColorId 
              ? nameColors.find(c => c.id === u.customization.nameColorId)
              : undefined,
            avatarFrame: u.customization.avatarFrameId 
              ? avatarFrames.find(f => f.id === u.customization.avatarFrameId)
              : undefined,
            badges: userBadges,
            showcaseAchievements: [],
          };
        }
        
        return {
          id: String(u.id),
          telegramId: u.telegramId || u.telegram_id,
          name: u.name || u.displayName || 'Пользователь',
          avatar: u.avatarUrl || u.avatar_url || u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
          bio: u.bio || '',
          role: u.role || 'participant',
          status: mapUserStatus(u.lookingForTeam, u.hasTeam || u.team_id || u.teamId),
          skills: u.skills || [],
          experience: u.experience || '',
          mmr: u.mmr || 0,
          pts: u.pts || u.points || 0,
          title: 'Новичок',
          nftStickers: [],
          createdAt: new Date(u.createdAt || u.created_at),
          updatedAt: new Date(u.updatedAt || u.updated_at || u.createdAt || u.created_at),
          customization,
        };
      });
      
      setUsers(transformedUsers);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.error || 'Не удалось загрузить пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  // Map backend user status
  const mapUserStatus = (lookingForTeam?: boolean, hasTeam?: boolean): User['status'] => {
    if (hasTeam) return 'in_team';
    if (lookingForTeam) return 'looking';
    return 'inactive';
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Фильтрация пользователей
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, filterStatus]);

  // Выбор/снятие выбора пользователя
  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Выбрать всех отфильтрованных
  const selectAll = () => {
    setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
  };

  // Снять выбор со всех
  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  // Отправка кейсов
  const [isDistributing, setIsDistributing] = useState(false);
  
  const handleDistribute = async () => {
    if (!selectedCase || selectedUsers.size === 0) return;
    
    setIsDistributing(true);
    
    try {
      // Convert Set<string> to number[] for API
      const userIds = Array.from(selectedUsers).map(id => parseInt(id, 10));
      
      // Call the API
      const result = await adminService.giveCases({
        userIds,
        caseType: selectedCase.rarity, // Use rarity as caseType
        caseName: selectedCase.name,
        rarity: selectedCase.rarity
      });
      
      console.log('Cases distributed:', result);
      
      // Создаем записи об отправке для UI
      const newRecords: GiftRecord[] = [];
      selectedUsers.forEach(userId => {
        const user = users.find(u => u.id === userId);
        if (user) {
          newRecords.push({
            userId,
            userName: user.name,
            caseId: selectedCase.name,
            caseName: selectedCase.name,
            timestamp: new Date()
          });
        }
      });

      // Добавляем в историю
      setGiftHistory(prev => [...newRecords, ...prev]);
      
      // Сбрасываем выбор
      setSelectedUsers(new Set());
      setSelectedCase(null);
      setShowConfirmModal(false);
      
      // Показываем toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err: any) {
      console.error('Failed to distribute cases:', err);
      setError(err.response?.data?.error || 'Не удалось выдать кейсы');
    } finally {
      setIsDistributing(false);
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
        <button className="btn btn-primary" onClick={fetchUsers}>
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-7 h-7 text-warning" />
            Выдача кейсов
          </h2>
          <p className="text-base-content/60 mt-1">
            Выберите пользователей и кейс для награждения
          </p>
        </div>
        
        {selectedUsers.size > 0 && selectedCase && (
          <button 
            onClick={() => setShowConfirmModal(true)}
            className="btn btn-primary gap-2"
          >
            <Send className="w-5 h-5" />
            Выдать ({selectedUsers.size})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Выбор кейса */}
        <div className="lg:col-span-1">
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">
                <Package className="w-5 h-5" />
                Выберите кейс
              </h3>
              
              <div className="space-y-3 mt-4">
                {caseTemplates.map((caseItem, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCase(caseItem)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedCase?.name === caseItem.name
                        ? 'border-primary bg-primary/10'
                        : 'border-base-300 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: getRarityColor(caseItem.rarity) + '20' }}
                      >
                        {caseItem.rarity === 'legendary' ? '👑' : 
                         caseItem.rarity === 'epic' ? '🏆' :
                         caseItem.rarity === 'rare' ? '🎖️' :
                         caseItem.rarity === 'uncommon' ? '📦' : '🎁'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{caseItem.name}</h4>
                        <p className="text-sm text-base-content/60 line-clamp-1">
                          {caseItem.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span 
                            className="badge badge-xs"
                            style={{ backgroundColor: getRarityColor(caseItem.rarity) + '30', color: getRarityColor(caseItem.rarity) }}
                          >
                            {caseItem.rarity}
                          </span>
                          <span className="badge badge-xs badge-ghost">
                            {caseItem.possibleItems.length} предметов
                          </span>
                        </div>
                      </div>
                      {selectedCase?.name === caseItem.name && (
                        <Check className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Выбор пользователей */}
        <div className="lg:col-span-2">
          <div className="card bg-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-lg">
                  <UserIcon className="w-5 h-5" />
                  Выберите пользователей
                  {selectedUsers.size > 0 && (
                    <span className="badge badge-primary">{selectedUsers.size}</span>
                  )}
                </h3>
                
                <div className="flex gap-2">
                  <button 
                    onClick={selectAll}
                    className="btn btn-ghost btn-sm"
                  >
                    Выбрать всех
                  </button>
                  {selectedUsers.size > 0 && (
                    <button 
                      onClick={clearSelection}
                      className="btn btn-ghost btn-sm"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
              </div>

              {/* Поиск и фильтры */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Поиск по имени..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input input-bordered w-full pl-10"
                  />
                </div>
                
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline gap-2">
                    <Filter className="w-4 h-4" />
                    Статус
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                    <li><button onClick={() => setFilterStatus('all')}>Все</button></li>
                    <li><button onClick={() => setFilterStatus('looking')}>Ищут команду</button></li>
                    <li><button onClick={() => setFilterStatus('in_team')}>В команде</button></li>
                  </ul>
                </div>
              </div>

              {/* Список пользователей */}
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {filteredUsers.map(user => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedUsers.has(user.id)
                        ? 'bg-primary/10 ring-2 ring-primary'
                        : 'bg-base-300/50 hover:bg-base-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="checkbox checkbox-primary"
                    />
                    
                    <CustomizedAvatar 
                      user={user} 
                      customization={user.customization} 
                      size="sm" 
                      showFrame={true}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">
                        <CustomizedName 
                          name={user.name} 
                          customization={user.customization}
                        />
                        {/* Show badges */}
                        {user.customization?.badges?.map((badge, idx) => (
                          <span key={idx} className="ml-1" title={badge.name}>
                            {badge.value || '🏅'}
                          </span>
                        ))}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {user.pts} PTS
                        </span>
                        <span className={`badge badge-xs ${
                          user.status === 'looking' ? 'badge-success' : 
                          user.status === 'in_team' ? 'badge-info' : 'badge-ghost'
                        }`}>
                          {user.status === 'looking' ? 'Ищет' : 
                           user.status === 'in_team' ? 'В команде' : 'Неактивен'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-base-content/60">
                    Пользователи не найдены
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* История выдачи */}
      {giftHistory.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">История выдачи кейсов</h3>
            
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>Кейс</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {giftHistory.slice(0, 10).map((record, idx) => (
                    <tr key={idx}>
                      <td>{record.userName}</td>
                      <td>{record.caseName}</td>
                      <td>{record.timestamp.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения */}
      {showConfirmModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Gift className="w-6 h-6 text-warning" />
              Подтверждение выдачи
            </h3>
            
            <div className="py-4">
              <p>Вы собираетесь выдать:</p>
              <div className="mt-2 p-4 bg-base-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: selectedCase ? getRarityColor(selectedCase.rarity) + '20' : '' }}
                  >
                    {selectedCase?.rarity === 'legendary' ? '👑' : 
                     selectedCase?.rarity === 'epic' ? '🏆' :
                     selectedCase?.rarity === 'rare' ? '🎖️' :
                     selectedCase?.rarity === 'uncommon' ? '📦' : '🎁'}
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedCase?.name}</h4>
                    <p className="text-sm text-base-content/60">
                      {selectedUsers.size} пользователям
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-base-content/60 mb-2">Получатели:</p>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {Array.from(selectedUsers).map(userId => {
                    const user = users.find(u => u.id === userId);
                    return user && (
                      <span key={userId} className="badge badge-outline">
                        {user.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-ghost"
                disabled={isDistributing}
              >
                <X className="w-4 h-4" />
                Отмена
              </button>
              <button 
                onClick={handleDistribute}
                className="btn btn-primary"
                disabled={isDistributing}
              >
                {isDistributing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isDistributing ? 'Отправка...' : 'Подтвердить'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)} />
        </div>
      )}

      {/* Toast успеха */}
      {showSuccessToast && (
        <div className="toast toast-end">
          <div className="alert alert-success">
            <Check className="w-5 h-5" />
            <span>Кейсы успешно выданы!</span>
          </div>
        </div>
      )}
    </div>
  );
}
