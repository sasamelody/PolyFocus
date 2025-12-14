import React, { useState } from 'react';
import { TimerMode } from '../types';

interface TagModalProps {
  isOpen: boolean;
  mode: TimerMode;
  onSave: (tags: string[]) => void;
  onDiscard: () => void;
}

const SUGGESTED_TAGS_WORK = ['工作-项目A', '学习-编程', '写作', '会议', '规划'];
const SUGGESTED_TAGS_BREAK = ['休息-阅读', '运动', '小憩', '社交', '咖啡'];

const TagModal: React.FC<TagModalProps> = ({ isOpen, mode, onSave, onDiscard }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleCustomAdd = () => {
    if (inputValue.trim()) {
      handleAddTag(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomAdd();
    }
  };

  const suggestions = mode === TimerMode.WORK ? SUGGESTED_TAGS_WORK : SUGGESTED_TAGS_BREAK;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-600 w-full max-w-md p-6 relative clip-shard-right shadow-[0_0_50px_rgba(79,70,229,0.3)]">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 uppercase tracking-widest">
          {mode === TimerMode.WORK ? '专注时段结束' : '休息时段结束'}
        </h2>
        <p className="text-slate-400 mb-6">记录您的活动以追踪时间效率。</p>

        {/* Selected Tags Area */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="bg-indigo-600 text-white px-3 py-1 text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-indigo-500 transition-colors"
              onClick={() => handleRemoveTag(tag)}
              style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
            >
              {tag} ✕
            </span>
          ))}
          {selectedTags.length === 0 && (
            <span className="text-slate-500 text-sm italic py-1">未选择标签...</span>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入自定义标签..."
            className="flex-1 bg-slate-900 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            onClick={handleCustomAdd}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 font-bold"
          >
            +
          </button>
        </div>

        {/* Suggestions */}
        <div className="mb-8">
          <p className="text-xs text-slate-500 mb-2 uppercase">快速添加:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 text-xs px-3 py-1 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
           <button
            onClick={onDiscard}
            className="text-slate-500 hover:text-white px-4 py-2 font-bold text-sm uppercase tracking-wider"
          >
            丢弃
          </button>
          <button
            onClick={() => onSave(selectedTags)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-2 font-bold uppercase tracking-widest shadow-lg transform hover:-translate-y-1 transition-all"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
          >
            保存记录
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagModal;