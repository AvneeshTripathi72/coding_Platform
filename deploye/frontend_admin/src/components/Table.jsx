function Table({ columns = [], data = [], rowKey = (row, i) => i, empty = 'No data.' }){
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="grid px-4 py-3 bg-white/5 text-sm text-white/70" style={{gridTemplateColumns: columns.map(c=>c.width||'1fr').join(' ')}}>
        {columns.map((c, i) => <div key={i} className={c.headerClassName}>{c.title}</div>)}
      </div>
      {data.map((row, i) => (
        <div key={rowKey(row, i)} className="grid px-4 py-3 border-t border-white/10 text-sm" style={{gridTemplateColumns: columns.map(c=>c.width||'1fr').join(' ')}}>
          {columns.map((c, j) => <div key={j} className={c.cellClassName}>{c.render ? c.render(row) : row[c.dataIndex]}</div>)}
        </div>
      ))}
      {data.length === 0 && <div className="px-4 py-8 text-white/60 text-sm">{empty}</div>}
    </div>
  )
}

export default Table
