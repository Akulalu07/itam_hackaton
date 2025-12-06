import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  X, 
  Plus, 
  Save,
  Code, 
  Palette, 
  Database, 
  Brain, 
  Settings,
  Users,
  Briefcase,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { UserSkill, SkillLevel } from '../../types';

// Предустановленные навыки по категориям
const SKILL_PRESETS = {
  frontend: ['React', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind', 'Next.js'],
  backend: ['Node.js', 'Python', 'Go', 'Java', 'C#', 'PostgreSQL', 'MongoDB', 'Redis'],
  design: ['Figma', 'UI/UX', 'Photoshop', 'Illustrator', 'Prototyping', 'Motion Design'],
  ml: ['TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Data Science', 'Python ML'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform'],
  management: ['Scrum', 'Agile', 'Jira', 'Product Management', 'Team Lead'],
};

const ROLES = [
  { value: 'frontend', label: 'Frontend Developer', icon: Code },
  { value: 'backend', label: 'Backend Developer', icon: Database },
  { value: 'fullstack', label: 'Full-Stack Developer', icon: Code },
  { value: 'design', label: 'UI/UX Designer', icon: Palette },
  { value: 'ml', label: 'ML/Data Engineer', icon: Brain },
  { value: 'devops', label: 'DevOps Engineer', icon: Settings },
  { value: 'pm', label: 'Project Manager', icon: Users },
];

const EXPERIENCE_OPTIONS = [
  { value: 'student', label: 'Студент / Начинающий', description: '< 1 года опыта' },
  { value: 'junior', label: 'Junior', description: '1-2 года опыта' },
  { value: 'middle', label: 'Middle', description: '2-4 года опыта' },
  { value: 'senior', label: 'Senior', description: '4+ лет опыта' },
];

/**
 * ProfilePage - Страница редактирования профиля
 */
export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading } = useAuthStore();
  
  // Инициализация из текущего профиля
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<keyof typeof SKILL_PRESETS>('frontend');
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Загрузить данные из профиля при монтировании
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setSelectedExperience(user.experience || '');
      setContactInfo(user.contactInfo || '');
      setSelectedRole(user.lookingFor?.[0] || '');
      
      // Конвертируем skills
      if (user.skills && Array.isArray(user.skills)) {
        const userSkills: UserSkill[] = user.skills.map((s, idx) => {
          if (typeof s === 'string') {
            return {
              id: `skill-${idx}`,
              name: s,
              level: 'intermediate' as SkillLevel,
              category: 'other' as const,
            };
          }
          return s;
        });
        setSkills(userSkills);
      }
    }
  }, [user]);

  // Отслеживание изменений
  useEffect(() => {
    if (!user) return;
    
    const skillNames = skills.map(s => s.name).sort().join(',');
    const originalSkillNames = (user.skills || []).map(s => typeof s === 'string' ? s : s.name).sort().join(',');
    
    const changed = 
      name !== (user.name || '') ||
      bio !== (user.bio || '') ||
      selectedExperience !== (user.experience || '') ||
      selectedRole !== (user.lookingFor?.[0] || '') ||
      contactInfo !== (user.contactInfo || '') ||
      skillNames !== originalSkillNames;
    
    setHasChanges(changed);
  }, [name, bio, selectedExperience, selectedRole, contactInfo, skills, user]);

  // Add skill
  const addSkill = (skillName: string, category?: keyof typeof SKILL_PRESETS) => {
    if (skills.find(s => s.name.toLowerCase() === skillName.toLowerCase())) return;
    if (skills.length >= 10) return;
    
    const newSkill: UserSkill = {
      id: Date.now().toString(),
      name: skillName,
      level: 'intermediate' as SkillLevel,
      category: (category || 'frontend') as any,
    };
    setSkills([...skills, newSkill]);
    setSkillInput('');
  };

  // Remove skill
  const removeSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  // Handle custom skill input
  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput.trim());
    }
  };

  // Handle submit
  const handleSave = async () => {
    if (isLoading) return;
    
    try {
      await updateProfile({
        name,
        skills,
        experience: selectedExperience,
        bio,
        lookingFor: selectedRole ? [selectedRole] : undefined,
        contactInfo,
      });
      
      setHasChanges(false);
      navigate(-1); // Вернуться назад
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-lg border-b border-base-200">
        <div className="px-4 py-4 max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm btn-circle">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Редактировать профиль</h1>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="btn btn-primary btn-sm gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Сохранить
          </button>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-8">
        {/* Name */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Имя</h2>
          <input
            type="text"
            placeholder="Твоё имя"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input input-bordered w-full"
          />
        </section>

        {/* Role Selection */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Твоя роль
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(role => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedRole === role.value
                    ? 'border-primary bg-primary/10'
                    : 'border-base-200 hover:border-base-300'
                }`}
              >
                <role.icon className={`w-6 h-6 mb-2 ${
                  selectedRole === role.value ? 'text-primary' : 'text-base-content/60'
                }`} />
                <p className="font-medium text-sm">{role.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Опыт
          </h2>
          <div className="space-y-2">
            {EXPERIENCE_OPTIONS.map(exp => (
              <button
                key={exp.value}
                onClick={() => setSelectedExperience(exp.value)}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  selectedExperience === exp.value
                    ? 'border-secondary bg-secondary/10'
                    : 'border-base-200 hover:border-base-300'
                }`}
              >
                <div className="text-left">
                  <p className="font-medium">{exp.label}</p>
                  <p className="text-sm text-base-content/60">{exp.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedExperience === exp.value
                    ? 'border-secondary bg-secondary'
                    : 'border-base-300'
                }`}>
                  {selectedExperience === exp.value && (
                    <div className="w-2 h-2 bg-secondary-content rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Code className="w-5 h-5 text-accent" />
            Навыки
            <span className="badge badge-sm badge-ghost">{skills.length}/10</span>
          </h2>
          
          {/* Selected Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map(skill => (
                <span 
                  key={skill.id}
                  className="badge badge-lg gap-1 pr-1 bg-primary/20 text-primary border-0"
                >
                  {skill.name}
                  <button 
                    onClick={() => removeSkill(skill.id)}
                    className="btn btn-ghost btn-xs btn-circle"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
            {Object.keys(SKILL_PRESETS).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as keyof typeof SKILL_PRESETS)}
                className={`btn btn-sm whitespace-nowrap ${
                  activeCategory === cat ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                {cat === 'frontend' && 'Frontend'}
                {cat === 'backend' && 'Backend'}
                {cat === 'design' && 'Дизайн'}
                {cat === 'ml' && 'ML/AI'}
                {cat === 'devops' && 'DevOps'}
                {cat === 'management' && 'PM'}
              </button>
            ))}
          </div>

          {/* Preset Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SKILL_PRESETS[activeCategory].map(skill => {
              const isSelected = skills.some(s => s.name === skill);
              return (
                <button
                  key={skill}
                  onClick={() => !isSelected && addSkill(skill, activeCategory)}
                  disabled={isSelected || skills.length >= 10}
                  className={`badge badge-lg ${
                    isSelected 
                      ? 'badge-primary opacity-50 cursor-not-allowed' 
                      : 'badge-outline hover:badge-primary cursor-pointer'
                  }`}
                >
                  {!isSelected && <Plus className="w-3 h-3 mr-1" />}
                  {skill}
                </button>
              );
            })}
          </div>

          {/* Custom Skill Input */}
          <div className="form-control">
            <input
              type="text"
              placeholder="Добавить свой навык..."
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              className="input input-bordered w-full"
              disabled={skills.length >= 10}
            />
          </div>
        </section>

        {/* Bio */}
        <section>
          <h2 className="text-lg font-semibold mb-3">О себе</h2>
          <textarea
            placeholder="Расскажи немного о себе, своих проектах и что ищешь в команде..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="textarea textarea-bordered w-full h-24 resize-none"
            maxLength={300}
          />
          <p className="text-xs text-base-content/50 text-right mt-1">{bio.length}/300</p>
        </section>

        {/* Contact Info */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Контакты</h2>
          <input
            type="text"
            placeholder="@telegram или email"
            value={contactInfo}
            onChange={e => setContactInfo(e.target.value)}
            className="input input-bordered w-full"
          />
          <p className="text-xs text-base-content/50 mt-1">
            Будет виден только членам твоей команды
          </p>
        </section>
      </div>
    </div>
  );
}
