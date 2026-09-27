import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  // Auto detect variant from text if variant is default
  let computedVariant = variant;
  if (typeof children === 'string' && variant === 'default') {
    const text = children.toLowerCase();
    if (['present', 'approved', 'evaluated', 'pass', 'active', 'high'].includes(text)) {
      computedVariant = 'success';
    } else if (['absent', 'rejected', 'fail', 'urgent', 'late'].includes(text)) {
      computedVariant = 'danger';
    } else if (['pending', 'in review', 'normal'].includes(text)) {
      computedVariant = 'warning';
    } else if (['submitted', 'theory'].includes(text)) {
      computedVariant = 'primary';
    } else if (['admin'].includes(text)) {
      computedVariant = 'purple';
    }
  }

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[computedVariant] || variants.default} ${sizes[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {children}
    </span>
  );
};

export default Badge;
