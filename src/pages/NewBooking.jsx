import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Toast from '../components/ui/Toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wifi,
  Monitor,
  Phone,
  Coffee,
  Car,
  Gamepad2
} from 'lucide-react';

const NewBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomIdParam = searchParams.get('roomId');

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const [formData, setFormData] = useState({
    roomId: roomIdParam || '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });

  const [errors, setErrors] = useState({});

  const facilitiesIcons = {
    'WiFi': Wifi,
    'Projector': Monitor,
    'Conference Phone': Phone,
    'Coffee Machine': Coffee,
    'Parking': Car,
    'Gaming Setup': Gamepad2
  };

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (roomIdParam && rooms.length > 0) {
      const room = rooms.find(r => r.id === parseInt(roomIdParam));
      if (room) {
        setSelectedRoom(room);
        setFormData(prev => ({ ...prev, roomId: roomIdParam }));
      }
    }
  }, [roomIdParam, rooms]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getAllRooms();
      if (response.success && response.data) {
        setRooms(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      showToast('Failed to load rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableRooms = async (date) => {
    try {
      const response = await roomService.getAvailableRooms(date);
      if (response.success && response.data) {
        setRooms(Array.isArray(response.data) ? response.data : [response.data]);
      }
    } catch (error) {
      console.error('Error loading available rooms:', error);
      showToast('Failed to load available rooms', 'error');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Load available rooms when date changes
    if (field === 'bookingDate' && value) {
      loadAvailableRooms(value);
    }

    // Update selected room when room changes
    if (field === 'roomId' && value) {
      const room = rooms.find(r => r.id === parseInt(value));
      setSelectedRoom(room);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomId) {
      newErrors.roomId = 'Please select a room';
    }

    if (!formData.bookingDate) {
      newErrors.bookingDate = 'Please select a booking date';
    } else {
      const selectedDate = new Date(formData.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.bookingDate = 'Booking date cannot be in the past';
      }

      // Check if booking is within 30 days
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      if (selectedDate > maxDate) {
        newErrors.bookingDate = 'Bookings can only be made up to 30 days in advance';
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Please select a start time';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Please select an end time';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }

      // Check business hours (8 AM - 6 PM)
      const startHour = start.getHours();
      const endHour = end.getHours();
      
      if (startHour < 8 || endHour > 18 || (endHour === 18 && end.getMinutes() > 0)) {
        newErrors.startTime = 'Bookings are only allowed between 8:00 AM and 6:00 PM';
      }

      // Check maximum duration (4 hours)
      const duration = (end - start) / (1000 * 60 * 60);
      if (duration > 4) {
        newErrors.endTime = 'Maximum booking duration is 4 hours';
      }
    }

    if (!formData.purpose || formData.purpose.trim().length < 10) {
      newErrors.purpose = 'Please provide a detailed purpose (minimum 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setSubmitting(true);
    
    try {
      const bookingData = {
        roomId: parseInt(formData.roomId),
        userId: user.id,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose.trim()
      };

      const response = await roomService.createBooking(bookingData);
      
      if (response.success) {
        showToast('Booking request submitted successfully!', 'success');
        setTimeout(() => {
          navigate('/bookings');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // Check if it's a conflict error and suggest alternatives
      if (error.message.includes('conflict') || error.message.includes('overlaps')) {
        await loadAlternatives();
        showToast('Time slot conflict! Please check alternative suggestions below.', 'error');
      } else {
        showToast(`Failed to create booking: ${error.message}`, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const loadAlternatives = async () => {
    if (!formData.roomId || !formData.bookingDate || !formData.startTime || !formData.endTime) {
      return;
    }

    try {
      const response = await roomService.getAlternativeRooms(
        formData.roomId,
        formData.bookingDate,
        formData.startTime,
        formData.endTime
      );
      
      if (response.success && response.data) {
        setAlternatives(Array.isArray(response.data) ? response.data : [response.data]);
        setShowAlternatives(true);
      }
    } catch (error) {
      console.error('Error loading alternatives:', error);
    }
  };

  const selectAlternativeRoom = (room) => {
    setSelectedRoom(room);
    setFormData(prev => ({ ...prev, roomId: room.id.toString() }));
    setShowAlternatives(false);
    showToast(`Selected ${room.name} as alternative`, 'success');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const getFacilityIcon = (facilityName) => {
    return facilitiesIcons[facilityName] || Monitor;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading rooms...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            onClick={() => navigate('/bookings')}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bookings</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">New Room Booking</h1>
        <p className="text-gray-600">
          Reserve a conference room for your meeting or study session
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Room Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Room <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => handleInputChange('roomId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.roomId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Choose a room...</option>
                    {rooms.filter(room => room.isActive).map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} - {room.location} (Capacity: {room.capacity})
                      </option>
                    ))}
                  </select>
                  {errors.roomId && (
                    <p className="mt-1 text-sm text-red-600">{errors.roomId}</p>
                  )}
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className={errors.bookingDate ? 'border-red-300' : ''}
                    required
                  />
                  {errors.bookingDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.bookingDate}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Bookings can be made up to 30 days in advance
                  </p>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      min="08:00"
                      max="17:00"
                      className={errors.startTime ? 'border-red-300' : ''}
                      required
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      min="08:00"
                      max="18:00"
                      className={errors.endTime ? 'border-red-300' : ''}
                      required
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Business hours: 8:00 AM - 6:00 PM (Maximum 4 hours per booking)
                </p>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    placeholder="Describe the purpose of your booking in detail..."
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.purpose ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                    minLength={10}
                  />
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Please provide a detailed description (minimum 10 characters)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4 pt-6">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>{submitting ? 'Submitting...' : 'Submit Booking Request'}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/bookings')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>

        {/* Room Preview & Alternatives */}
        <div className="space-y-6">
          {/* Selected Room Preview */}
          {selectedRoom && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Room</h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedRoom.name}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{selectedRoom.location || 'Location not specified'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Capacity</span>
                    </div>
                    <span className="font-medium">{selectedRoom.capacity} people</span>
                  </div>

                  {selectedRoom.description && (
                    <div>
                      <p className="text-sm text-gray-600">{selectedRoom.description}</p>
                    </div>
                  )}

                  {selectedRoom.facilities && selectedRoom.facilities.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Facilities</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedRoom.facilities.map((facility, index) => {
                          const IconComponent = getFacilityIcon(facility);
                          return (
                            <div
                              key={index}
                              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              <IconComponent className="w-3 h-3" />
                              <span>{facility}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Alternative Rooms */}
          {showAlternatives && alternatives.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Alternative Rooms</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  The selected time slot is not available. Here are some alternatives:
                </p>
                
                <div className="space-y-3">
                  {alternatives.map((room) => (
                    <div
                      key={room.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-teal-300 cursor-pointer transition-colors"
                      onClick={() => selectAlternativeRoom(room)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{room.name}</h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="w-3 h-3 mr-1" />
                          <span>{room.capacity}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{room.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Booking Rules */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Rules</h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Business Hours:</span> 8:00 AM - 6:00 PM
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Maximum Duration:</span> 4 hours per booking
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Users className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Daily Limit:</span> 2 bookings per user per day
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RefreshCw className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Advance Booking:</span> Up to 30 days ahead
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default NewBooking;