import React, { useState, useEffect } from 'react';

const getDefaultColorClass = (number) => {
  const num = parseInt(number);
  if (num <= 25) return 'color-1-25';
  if (num <= 50) return 'color-26-50';
  if (num <= 75) return 'color-51-75';
  if (num <= 100) return 'color-76-100';
  if (num <= 125) return 'color-101-125';
  if (num <= 150) return 'color-126-150';
  return 'color-151-176';
};

const NumberSelector = ({ 
  items,
  onItemSelect,
  selectedItem,
  loadingMessage,
  emptyMessage,
  className,
  itemClassName,
  gridClassName,
  getColorClass = getDefaultColorClass,
  renderItem,
  getItemTitle,
  srOnlyTitle
}) => {
  const [selected, setSelected] = useState(selectedItem || null);

  useEffect(() => {
    setSelected(selectedItem || null);
  }, [selectedItem]);

  const handleItemClick = (item) => {
    setSelected(item);
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  if (!items || items.length === 0) {
    return <div className="loading">{emptyMessage || "No items available..."}</div>;
  }

  return (
    <div className={className}>
      <h2 className="sr-only">{srOnlyTitle}</h2>
      <div className={gridClassName}>
        {items.map((item) => {
          const itemKey = item.key || item.value || item;
          const itemValue = item.value || item;
          
          return (
            <button
              key={itemKey}
              type="button"
              className={`${itemClassName} ${getColorClass ? getColorClass(itemValue) : ''} ${selected === itemValue ? 'selected' : ''}`}
              onClick={() => handleItemClick(itemValue)}
              title={getItemTitle ? getItemTitle(item) : `${srOnlyTitle} ${itemValue}`}
            >
              {renderItem ? renderItem(item) : itemValue}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NumberSelector;