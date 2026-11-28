import os

def update_bid_client():
    path = r"C:\Users\user\work\bid_table\src\app\supplier\rfqs\[id]\bid\BidClient.tsx"
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()

    # inputs
    c = c.replace(
        'className="w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold text-right bg-white disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"',
        'className="w-20 px-2.5 py-1.5 rounded-lg border border-zinc-700 text-xs font-mono font-bold text-right bg-[#181a1d] text-white disabled:bg-zinc-900 disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"'
    )
    c = c.replace(
        'className="w-28 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold text-right bg-white disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"',
        'className="w-28 px-2.5 py-1.5 rounded-lg border border-zinc-700 text-xs font-mono font-bold text-right bg-[#181a1d] text-white disabled:bg-zinc-900 disabled:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"'
    )

    # td & units
    c = c.replace('bg-blue-50/40 whitespace-nowrap', 'bg-emerald-950/20 whitespace-nowrap')
    c = c.replace('text-blue-700 text-sm font-mono', 'text-emerald-400 text-sm font-mono')
    c = c.replace('text-rose-500', 'text-rose-400')
    c = c.replace('font-bold text-xs text-gray-800 whitespace-nowrap', 'font-bold text-xs text-zinc-200 whitespace-nowrap')
    c = c.replace('text-xs text-gray-500', 'text-xs text-zinc-400')
    c = c.replace('text-xs font-mono font-semibold text-gray-500', 'text-xs font-mono font-semibold text-zinc-400')
    c = c.replace('text-xs text-gray-400', 'text-xs text-zinc-500')

    # bottom bar
    c = c.replace(
        'p-6 bg-slate-50 border-t border-gray-200 flex flex-col lg:flex-row',
        'p-6 bg-[#181a1d] border-t border-zinc-800 flex flex-col lg:flex-row'
    )
    c = c.replace('text-base font-extrabold text-gray-900', 'text-base font-extrabold text-white')
    c = c.replace('text-base font-extrabold text-blue-700', 'text-base font-extrabold text-emerald-400')
    c = c.replace(
        'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
        'border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
    )
    c = c.replace(
        'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-blue-500/20',
        'bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-emerald-500/20'
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(c)
    print("BidClient updated successfully!")

update_bid_client()
