from pathlib import Path

root = Path('/home/ubuntu/letter-play/client/src/pages/games')
targets = list(root.glob('*.tsx')) + [Path('/home/ubuntu/letter-play/client/src/pages/TeacherDashboard.tsx')]
for path in targets:
    text = path.read_text()
    replacements = {
        'rounded-3xl': 'rounded-xl',
        'rounded-2xl': 'rounded-lg',
        'rounded-xl': 'rounded-lg',
        'border-3': 'border',
        'shadow-xl': 'shadow-sm',
        'shadow-md': 'shadow-sm',
        'shadow-lg': 'shadow-sm',
        'bg-white/90 backdrop-blur-sm': 'bg-white',
        'bg-white/95 backdrop-blur-sm': 'bg-white',
        'bg-amber-50/70': 'bg-slate-50',
        'bg-amber-50/60': 'bg-slate-50',
        'border-amber-200': 'border-slate-200',
        'border-amber-300': 'border-slate-300',
        'border-amber-100': 'border-slate-100',
        'bg-amber-50': 'bg-slate-50',
        'text-amber-900': 'text-slate-800',
        'text-[#3D3580]': 'text-slate-900',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    path.write_text(text)
print('Updated surfaces:', len(targets))
