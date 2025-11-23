import React from 'react';
import clsx from 'clsx';

const Table = ({ columns, data, onRowClick, emptyMessage = 'No data available' }) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={clsx(
                      'px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500 text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={clsx(
                      'transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-gray-50'
                    )}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={clsx(
                          'px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm',
                          column.cellClassName
                        )}
                      >
                        {column.render
                          ? column.render(row, rowIndex)
                          : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
