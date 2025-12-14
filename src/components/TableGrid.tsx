import React from 'react';
import { cn } from '@/lib/utils';
import { Users, MapPin } from 'lucide-react';

interface Table {
  id: string;
  table_number: number;
  capacity: number;
  location: string;
}

interface TableGridProps {
  tables: Table[];
  reservedTableIds: string[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  loading?: boolean;
}

const TableGrid: React.FC<TableGridProps> = ({
  tables,
  reservedTableIds,
  selectedTableId,
  onSelectTable,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg animate-shimmer"
          />
        ))}
      </div>
    );
  }

  // Group tables by location
  const tablesByLocation = tables.reduce((acc, table) => {
    if (!acc[table.location]) {
      acc[table.location] = [];
    }
    acc[table.location].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  const locationOrder = ['Window View', 'Main Hall', 'Garden Section', 'Private Dining'];

  return (
    <div className="space-y-8">
      {locationOrder.map((location) => {
        const locationTables = tablesByLocation[location] || [];
        if (locationTables.length === 0) return null;

        return (
          <div key={location} className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                {location}
              </h3>
              <span className="text-sm text-muted-foreground">
                ({locationTables.length} tables)
              </span>
            </div>
            
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {locationTables.map((table) => {
                const isReserved = reservedTableIds.includes(table.id);
                const isSelected = selectedTableId === table.id;

                return (
                  <button
                    key={table.id}
                    onClick={() => !isReserved && onSelectTable(table.id)}
                    disabled={isReserved}
                    className={cn(
                      "aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 p-1",
                      isReserved && "table-reserved",
                      isSelected && "table-selected",
                      !isReserved && !isSelected && "table-available"
                    )}
                    title={`Table ${table.table_number} - ${table.capacity} seats - ${table.location}`}
                  >
                    <span className="text-xs font-bold">{table.table_number}</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Users className="w-2.5 h-2.5" />
                      <span className="text-[10px]">{table.capacity}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 table-available" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 table-reserved" />
          <span className="text-sm text-muted-foreground">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 table-selected" />
          <span className="text-sm text-muted-foreground">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default TableGrid;
