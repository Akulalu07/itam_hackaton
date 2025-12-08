import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Check, Shield } from 'lucide-react';
import { swipeService } from '../../api/services';

// Предопределённые навыки для фильтра
const SKILLS = [
  'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript',
  'Python', 'Go', 'Rust', 'Java', 'C#',
  'Node.js', 'Django', 'FastAPI', 'Spring',
  'PostgreSQL', 'MongoDB', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'GCP',
  'UI/UX', 'Figma', 'Product Management',
];

// Уровни опыта
const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Новичок' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
  { value: 'expert', label: 'Эксперт' },
];

// Роли
const ROLES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' },
  { value: 'designer', label: 'Дизайнер' },
  { value: 'pm', label: 'Менеджер' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data Science' },
  { value: 'mobile', label: 'Mobile' },
];

interface SwipeFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export function SwipeFiltersModal({ isOpen, onClose, onApply }: SwipeFiltersModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [minMmr, setMinMmr] = useState<number | undefined>(undefined);
  const [maxMmr, setMaxMmr] = useState<number | undefined>(undefined);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Загружаем настройки при открытии
  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const prefs = await swipeService.getPreferences();
      setMinMmr(prefs.minMmr);
      setMaxMmr(prefs.maxMmr);
      setSelectedSkills(prefs.preferredSkills || []);
      setSelectedExperience(prefs.preferredExperience || []);
      setSelectedRoles(prefs.preferredRoles || []);
      setVerifiedOnly(prefs.verifiedOnly || false);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await swipeService.updatePreferences({
        minMmr,
        maxMmr,
        preferredSkills: selectedSkills,
        preferredExperience: selectedExperience,
        preferredRoles: selectedRoles,
        verifiedOnly,
      });
      onApply();
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMinMmr(undefined);
    setMaxMmr(undefined);
    setSelectedSkills([]);
    setSelectedExperience([]);
    setSelectedRoles([]);
    setVerifiedOnly(false);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleExperience = (exp: string) => {
    setSelectedExperience(prev =>
      prev.includes(exp)
        ? prev.filter(e => e !== exp)
        : [...prev, exp]
    );
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  if (!isOpen) return null;

  const hasActiveFilters = 
    minMmr !== undefined || 
    maxMmr !== undefined || 
    selectedSkills.length > 0 || 
    selectedExperience.length > 0 ||
    selectedRoles.length > 0 ||
    verifiedOnly;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Фильтры поиска</h3>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* MMR Range */}
            <div>
              <h4 className="font-semibold mb-3">MMR (рейтинг навыков)</h4>
              <div className="flex gap-3 items-center">
                <div className="form-control flex-1">
                  <label className="label py-1">
                    <span className="label-text text-xs">От</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="input input-bordered input-sm w-full"
                    value={minMmr ?? ''}
                    onChange={(e) => setMinMmr(e.target.value ? Number(e.target.value) : undefined)}
                    min={0}
                    max={3000}
                  />
                </div>
                <span className="text-base-content/50 mt-6">—</span>
                <div className="form-control flex-1">
                  <label className="label py-1">
                    <span className="label-text text-xs">До</span>
                  </label>
                  <input
                    type="number"
                    placeholder="3000"
                    className="input input-bordered input-sm w-full"
                    value={maxMmr ?? ''}
                    onChange={(e) => setMaxMmr(e.target.value ? Number(e.target.value) : undefined)}
                    min={0}
                    max={3000}
                  />
                </div>
              </div>
            </div>

            {/* Verified Only */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success" />
                  <span className="label-text">Только с проверенными навыками</span>
                </div>
              </label>
            </div>

            {/* Experience Level */}
            <div>
              <h4 className="font-semibold mb-3">Уровень опыта</h4>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp.value}
                    className={`btn btn-sm ${
                      selectedExperience.includes(exp.value)
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                    onClick={() => toggleExperience(exp.value)}
                  >
                    {selectedExperience.includes(exp.value) && (
                      <Check className="w-3 h-3" />
                    )}
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Roles */}
            <div>
              <h4 className="font-semibold mb-3">Предпочтительные роли</h4>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    className={`btn btn-sm ${
                      selectedRoles.includes(role.value)
                        ? 'btn-secondary'
                        : 'btn-outline'
                    }`}
                    onClick={() => toggleRole(role.value)}
                  >
                    {selectedRoles.includes(role.value) && (
                      <Check className="w-3 h-3" />
                    )}
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="font-semibold mb-3">Навыки</h4>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    className={`btn btn-xs ${
                      selectedSkills.includes(skill)
                        ? 'btn-accent'
                        : 'btn-ghost btn-outline'
                    }`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {selectedSkills.includes(skill) && (
                      <Check className="w-3 h-3" />
                    )}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="modal-action mt-4 pt-4 border-t border-base-300">
          <div className="flex gap-2 w-full">
            {hasActiveFilters && (
              <button className="btn btn-ghost" onClick={handleReset}>
                Сбросить
              </button>
            )}
            <div className="flex-1" />
            <button className="btn btn-ghost" onClick={onClose}>
              Отмена
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Применить'
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </div>
    </div>
  );
}
