import React from "react";
import "../styles/ui.css";

/**
 * Tabla simple reutilizable.
 *
 * headers: array de strings
 * data: array de filas
 * renderRow: (item, index) => <tr>...</tr> (debe incluir key)
 */
const DataTable = ({
  headers = [],
  data = [],
  renderRow,
  emptyMessage = "No hay datos para mostrar.",
  className = "",
  headerClassName = "",
  bodyClassName = "",
  emptyClassName = "table-empty",
  emptyColSpan,
}) => {
  const span = emptyColSpan || headers.length || 1;

  return (
    <table className={className || "data-table"}>
      <thead className={headerClassName}>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className={bodyClassName}>
        {!data || data.length === 0 ? (
          <tr>
            <td colSpan={span} className={emptyClassName}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((item, idx) => renderRow(item, idx))
        )}
      </tbody>
    </table>
  );
};

export default DataTable;
