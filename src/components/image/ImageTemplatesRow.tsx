import { useState } from 'react';
import { Bookmark, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function ImageTemplatesRow() {
  const templates = useAppStore((s) => s.templates);
  const applyTemplate = useAppStore((s) => s.applyTemplate);
  const addTemplate = useAppStore((s) => s.addTemplate);
  const removeTemplate = useAppStore((s) => s.removeTemplate);
  const imageSettings = useAppStore((s) => s.imageSettings);
  const pushToast = useAppStore((s) => s.pushToast);

  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const onSaveTemplate = () => {
    if (!templateName.trim()) {
      pushToast('error', 'Give your template a name');
      return;
    }
    addTemplate(templateName, imageSettings);
    pushToast('success', `Template "${templateName}" saved`);
    setTemplateName('');
    setSavingTemplate(false);
  };

  return (
    <div className="mb-3 rounded-xl bg-white/[0.03] border border-white/[0.05] p-2.5">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <Bookmark size={11} className="text-neutral-600" />
          <span className="text-[11px] font-medium text-neutral-500">Templates</span>
        </div>
        {!savingTemplate && (
          <button
            onClick={() => setSavingTemplate(true)}
            className="text-[10px] text-neutral-600 hover:text-neutral-200 transition-colors"
          >
            + Save current
          </button>
        )}
      </div>

      {savingTemplate && (
        <div className="flex items-center gap-1.5 mb-2 px-0.5">
          <input
            autoFocus
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveTemplate();
              if (e.key === 'Escape') {
                setTemplateName('');
                setSavingTemplate(false);
              }
            }}
            className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-md px-2 py-1 text-[11px] text-white placeholder-neutral-600 outline-none focus:border-white/20"
          />
          <button
            onClick={onSaveTemplate}
            className="px-2 py-1 rounded-md bg-white text-black text-[10px] font-semibold hover:bg-neutral-100 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => {
              setTemplateName('');
              setSavingTemplate(false);
            }}
            className="px-1.5 py-1 rounded-md text-[10px] text-neutral-500 hover:text-neutral-200"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {templates.map((t) => (
          <div
            key={t.id}
            className="group flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.05] hover:bg-white/[0.07] hover:border-white/[0.1] transition-all overflow-hidden"
          >
            <button
              onClick={() => {
                applyTemplate(t);
                pushToast('success', `Applied "${t.name}"`);
              }}
              className="text-[11px] text-neutral-300 pl-2.5 py-1 pr-1 hover:text-white transition-colors"
            >
              {t.name}
            </button>
            {!t.builtIn && (
              <button
                onClick={() => removeTemplate(t.id)}
                className="pr-2 py-1 text-neutral-600 hover:text-neutral-300 transition-colors"
                aria-label={`Delete ${t.name}`}
              >
                <X size={9} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
