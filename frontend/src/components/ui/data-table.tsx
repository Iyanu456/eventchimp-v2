import { cn } from "@/lib/utils";

export function DataTable({
  columns,
  rows,
  empty
}: {
  columns: string[];
  rows: React.ReactNode[][];
  empty?: React.ReactNode;
}) {
  if (!rows.length && empty) {
    return <div className="table-shell p-6">{empty}</div>;
  }

  return (
    <div className="table-shell overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="table-header">
            {columns.map((column) => (
              <th key={column} className="px-6 py-4">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="table-row">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "px-6 py-4 align-top text-sm",
                    cellIndex === 0 ? "font-medium text-ink" : "text-muted"
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
