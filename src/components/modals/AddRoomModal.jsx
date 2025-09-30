import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Plus, Minus, MapPin, Users, FileText, Building2 } from 'lucide-react';

const AddRoomModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    location: '',
    description: '',
    facilities: [],
    isActive: true
  });
  
  const [newFacility, setNewFacility] = useState('');
  const [errors, setErrors] = useState({});

  // Common facilities options
  const commonFacilities = [
    'WiFi',
    'Projector', 
    'Conference Phone',
    'Coffee Machine',
    'Parking',
    'Gaming Setup',
    'Air Conditioning',
    'Whiteboard',
    'TV Screen',
    'Sound System'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    }
    
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Valid capacity is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      capacity: parseInt(formData.capacity),
      facilities: formData.facilities.filter(f => f.trim() !== '')
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addFacility = (facility) => {
    if (facility.trim() && !formData.facilities.includes(facility.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facility.trim()]
      }));
    }
    setNewFacility('');
  };

  const removeFacility = (facilityToRemove) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facilityToRemove)
    }));
  };

  const addCommonFacility = (facility) => {
    if (!formData.facilities.includes(facility)) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facility]
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: '',
      location: '',
      description: '',
      facilities: [],
      isActive: true
    });
    setNewFacility('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Room</h2>
              <p className="text-sm text-gray-600">Create a new conference room</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Room Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Conference Room A"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Capacity and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Capacity *
              </label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="e.g., 10"
                min="1"
                className={errors.capacity ? 'border-red-500' : ''}
              />
              {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location *
              </label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., 2nd Floor, Building A"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the room..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilities
            </label>
            
            {/* Common Facilities */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Quick add common facilities:</p>
              <div className="flex flex-wrap gap-2">
                {commonFacilities.map((facility) => (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => addCommonFacility(facility)}
                    disabled={formData.facilities.includes(facility)}
                    className={`
                      px-3 py-1 text-xs rounded-full border transition-colors
                      ${formData.facilities.includes(facility)
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {facility}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Facility Input */}
            <div className="flex space-x-2 mb-3">
              <Input
                type="text"
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                placeholder="Add custom facility..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFacility(newFacility);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addFacility(newFacility)}
                variant="outline"
                size="sm"
                disabled={!newFacility.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Facilities */}
            {formData.facilities.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Selected facilities:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                    >
                      <span>{facility}</span>
                      <button
                        type="button"
                        onClick={() => removeFacility(facility)}
                        className="text-teal-600 hover:text-teal-800"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Room is active and available for booking
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Room</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;