from pathlib import Path
root = Path('/home/ubuntu/letter-play/client/src/pages')

repls = {
    'HomeScreen.tsx': [
        ('import mascot from "@/imports/mascot.png";\n', ''),
        ('<img src={mascot} alt="Mascote Letter Play" className="h-16 w-16 object-contain" />', '<span role="img" aria-label="Livro do Letter Play" className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-4xl shadow-[0_7px_0_#c7d2fe]">📖</span>'),
        ('<main className="min-h-screen bg-[#f8fafc] px-5 py-8 sm:px-10">', '<main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#fff7ed] via-[#f8f7ff] to-[#ecfeff] px-4 py-5 sm:px-8 sm:py-8">'),
        ('<div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">', '<div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-5xl items-center">'),
        ('<div className="mb-7 flex items-center gap-3">', '<div className="mb-6 flex items-center gap-3 sm:mb-8">'),
        ('<h1 className="font-title text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-7xl">', '<h1 className="font-title text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-7xl">'),
        ('<p className="mt-6 max-w-md text-lg leading-relaxed text-slate-500">', '<p className="mt-5 max-w-md text-base leading-relaxed text-slate-600 sm:mt-6 sm:text-lg">'),
        ('<div className="mt-10 flex flex-col gap-3 sm:flex-row">', '<div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2">'),
        ('className="bg-teal-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-sm hover:bg-teal-700"', 'className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-teal-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_6px_0_#0f766e] transition-all hover:bg-teal-600 active:translate-y-1 active:shadow-none"'),
        ('>Entrar como aluno</button>', '>🎒 Entrar como aluno</button>'),
        ('className="border border-slate-300 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-800 hover:border-slate-400 hover:bg-slate-50"', 'className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-fuchsia-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-800 shadow-[0_6px_0_#f5d0fe] transition-all hover:bg-fuchsia-50 active:translate-y-1 active:shadow-none"'),
        ('>Área do professor</button>', '>🧑‍🏫 Área do professor</button>'),
        ('<section className="relative hidden min-h-[440px] overflow-hidden bg-[#e6f4f1]">', '<section className="relative mt-5 min-h-[300px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-200 via-fuchsia-100 to-amber-100 shadow-[0_10px_0_#c7d2fe] sm:min-h-[400px] lg:mt-0 lg:min-h-[440px]">'),
        ('<div className="relative flex h-full min-h-[440px] items-center justify-center p-10">', '<div className="relative flex h-full min-h-[300px] items-center justify-center p-5 sm:min-h-[400px] sm:p-10 lg:min-h-[440px]">'),
        ('<div className="max-w-xs border border-white/70 bg-white/80 p-7 shadow-sm backdrop-blur-sm">', '<div className="max-w-xs rounded-3xl border-2 border-white/80 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-7">'),
    ],
    'StudentHub.tsx': [
        ('import mascot from "@/imports/mascot.png";\n', ''),
        ('<main className="min-h-screen bg-[#f8fafc] px-5 py-6 sm:px-10">', '<main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#fff7ed] via-[#f8f7ff] to-[#ecfeff] px-4 py-4 sm:px-8 sm:py-6">'),
        ('<header className="flex items-center justify-between border-b border-slate-200 pb-5">', '<header className="flex items-center justify-between border-b-2 border-indigo-100 pb-4 sm:pb-5">'),
        ('<div className="flex items-center gap-3"><img src={mascot} alt="Mascote" className="h-10 w-10 object-contain" /><span className="font-title text-2xl font-bold text-slate-900">Letter Play</span></div>', '<div className="flex items-center gap-2"><span role="img" aria-label="Livro" className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl shadow-[0_4px_0_#c7d2fe]">📖</span><span className="font-title text-xl font-bold text-slate-900 sm:text-2xl">Letter Play</span></div>'),
        ('<section className="grid gap-8 py-10 lg:grid-cols-[1fr_260px]">', '<section className="grid gap-6 py-7 sm:gap-8 sm:py-10 lg:grid-cols-[1fr_260px]">'),
        ('<h1 className="mt-2 font-title text-4xl font-bold text-slate-950 sm:text-5xl">', '<h1 className="mt-2 font-title text-3xl font-bold text-slate-950 sm:text-5xl">'),
        ('className="group soft-panel flex min-h-[148px] flex-col justify-between p-5 text-left hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_8px_0_#e0e7ff]"', 'className="group soft-panel flex min-h-[154px] flex-col justify-between rounded-3xl border-2 border-indigo-100 bg-white/90 p-4 text-left shadow-[0_5px_0_#e0e7ff] transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_9px_0_#c7d2fe] active:translate-y-0 sm:p-5"'),
        ('<aside className="h-fit border border-slate-200 bg-white p-6 shadow-sm">', '<aside className="h-fit rounded-3xl border-2 border-amber-100 bg-white/90 p-5 shadow-[0_6px_0_#fde68a] sm:p-6">'),
    ],
}

for name, pairs in repls.items():
    path = root / name
    text = path.read_text()
    for old, new in pairs:
        if old not in text:
            print(f'warning: missing pattern in {name}: {old[:50]}')
        text = text.replace(old, new)
    path.write_text(text)

for name in ['StudentLogin.tsx', 'TeacherLogin.tsx']:
    path = root / name
    text = path.read_text().replace('import mascot from "@/imports/mascot.png";\n', '')
    text = text.replace('<img src={mascot} alt="Mascote" className="h-12 w-12 object-contain" />', '<span role="img" aria-label="Livro" className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-3xl shadow-[0_5px_0_#c7d2fe]">📖</span>')
    text = text.replace('px-5 py-8 sm:px-10', 'px-4 py-5 sm:px-8 sm:py-8')
    text = text.replace('soft-panel p-7 sm:p-9', 'soft-panel rounded-3xl border-2 border-indigo-100 bg-white/95 p-5 shadow-[0_8px_0_#e0e7ff] sm:p-9')
    text = text.replace('bg-teal-600 px-4 py-3.5', 'rounded-2xl bg-teal-500 px-4 py-3.5 shadow-[0_5px_0_#0f766e] hover:bg-teal-600 active:translate-y-1 active:shadow-none')
    text = text.replace('bg-rose-500 px-4 py-3.5', 'rounded-2xl bg-fuchsia-500 px-4 py-3.5 shadow-[0_5px_0_#a21caf] hover:bg-fuchsia-600 active:translate-y-1 active:shadow-none')
    path.write_text(text)
print('mobile brand refinements applied')
