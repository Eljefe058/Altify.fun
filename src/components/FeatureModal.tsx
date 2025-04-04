import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: any) => void;
  feature: {
    name: string;
    description: string;
    warning: string;
    fields: {
      name: string;
      label: string;
      description: string;
      type: 'text' | 'number' | 'checkbox' | 'select';
      placeholder?: string;
      options?: { label: string; value: any }[];
      min?: number;
      max?: number;
      step?: number;
      required?: boolean;
    }[];
  };
}

interface ValidationError {
  field: string;
  message: string;
}

export default function FeatureModal({ isOpen, onClose, onConfirm, feature }: FeatureModalProps) {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [hasAccepted, setHasAccepted] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  // Initialize settings with default values
  useEffect(() => {
    const defaultSettings: Record<string, any> = {};
    feature.fields.forEach(field => {
      if (field.type === 'checkbox') {
        defaultSettings[field.name] = false;
      } else if (field.type === 'select' && field.options?.length) {
        defaultSettings[field.name] = field.options[0].value;
      } else if (field.type === 'number') {
        defaultSettings[field.name] = '';
      } else {
        defaultSettings[field.name] = '';
      }
    });
    setSettings(defaultSettings);
    setSubmitted(false);
    setTouched({});
    setErrors([]);
  }, [feature]);

  const validateField = (field: typeof feature.fields[0], value: any): string | null => {
    // Required field validation
    if (field.required !== false) {
      if (value === undefined || value === null || value === '') {
        return 'This field is required';
      }
    }

    // Type-specific validation
    if (field.type === 'number') {
      if (value === '') {
        return field.required !== false ? 'This field is required' : null;
      }
      
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Please enter a valid number';
      }
      if (field.min !== undefined && numValue < field.min) {
        return `Minimum value is ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `Maximum value is ${field.max}`;
      }
    }

    // Text field validation
    if (field.type === 'text' && field.required !== false) {
      if (!value.trim()) {
        return 'This field is required';
      }
    }

    return null;
  };

  const validateAllFields = (): boolean => {
    const newErrors: ValidationError[] = [];
    let isValid = true;
    
    feature.fields.forEach(field => {
      const error = validateField(field, settings[field.name]);
      if (error) {
        newErrors.push({ field: field.name, message: error });
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (field: typeof feature.fields[0], value: any) => {
    setSettings(prev => ({ ...prev, [field.name]: value }));
    setTouched(prev => ({ ...prev, [field.name]: true }));

    // Validate the changed field
    const error = validateField(field, value);
    setErrors(prev => {
      const filtered = prev.filter(e => e.field !== field.name);
      if (error) {
        filtered.push({ field: field.name, message: error });
      }
      return filtered;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    feature.fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const isValid = validateAllFields();

    if (!hasAccepted || !isValid) {
      return;
    }

    onConfirm(settings);
    onClose();
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(e => e.field === fieldName)?.message;
  };

  if (!isOpen) return null;

  const isValid = errors.length === 0 && hasAccepted && 
    feature.fields.every(field => 
      field.required !== false ? settings[field.name] !== undefined && settings[field.name] !== '' : true
    );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] rounded-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">{feature.name}</h2>
        <p className="text-gray-400 mb-6">{feature.description}</p>

        {/* Warning Box */}
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">{feature.warning}</p>
          </div>
        </div>

        {submitted && errors.length > 0 && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium mb-1">Please fix the following errors:</p>
                <ul className="list-disc list-inside text-sm text-red-400">
                  {errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feature Settings */}
          {feature.fields.map((field) => {
            const error = (touched[field.name] || submitted) ? getFieldError(field.name) : undefined;
            
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-300 mb-2">
                  {field.label}
                  {field.required !== false && <span className="text-red-400 ml-1">*</span>}
                </label>
                <div className="mb-2 flex items-start gap-2 text-sm text-gray-400">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{field.description}</p>
                </div>
                <div className="relative">
                  {field.type === 'select' ? (
                    <select
                      id={field.name}
                      value={settings[field.name] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, [field.name]: true }))}
                      className={`w-full px-4 py-2 bg-[#1e1e1e] border rounded-lg focus:outline-none focus:border-[#7a5cff] text-white transition-colors ${
                        error ? 'border-red-500' : 'border-gray-700'
                      }`}
                      required={field.required !== false}
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-3 text-gray-300">
                      <input
                        type="checkbox"
                        id={field.name}
                        checked={settings[field.name] || false}
                        onChange={(e) => handleChange(field, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-700 text-[#7a5cff] focus:ring-[#7a5cff] focus:ring-offset-gray-900"
                      />
                      <span className="text-sm">{field.label}</span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      id={field.name}
                      value={settings[field.name] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, [field.name]: true }))}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-2 bg-[#1e1e1e] border rounded-lg focus:outline-none focus:border-[#7a5cff] text-white transition-colors ${
                        error ? 'border-red-500' : 'border-gray-700'
                      }`}
                      required={field.required !== false}
                    />
                  )}
                  {error && (
                    <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Legal Disclaimer */}
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mt-8">
            <label className="flex items-start gap-3 text-gray-300">
              <input
                type="checkbox"
                checked={hasAccepted}
                onChange={(e) => setHasAccepted(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-gray-700 text-[#7a5cff] focus:ring-[#7a5cff] focus:ring-offset-gray-900"
                required
              />
              <span className="text-sm">
                I understand that I am fully responsible for this feature and Altify.fun is not liable
                for any outcome. I have read and understood the risks involved.
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitted && !isValid}
              className="flex-1 bg-[#7a5cff] hover:bg-[#6a4cef] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Enable Feature
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}