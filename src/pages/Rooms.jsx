import { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Toast from '../components/ui/Toast';
import AddRoomModal from '../components/modals/AddRoomModal';
import { 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  RefreshCw,
  Calendar,
  Clock,
  Wifi,
  Monitor,
  Phone,
  Coffee,
  Car,
  Gamepad2,
  Plus
} from 'lucide-react';

const Rooms = () => {
  const { user, USER_ROLES } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingRoom, setAddingRoom] = useState(false);

  // Available facilities with icons
  const facilitiesOptions = [
    { name: 'WiFi', icon: Wifi },
    { name: 'Projector', icon: Monitor },
    { name: 'Conference Phone', icon: Phone },
    { name: 'Coffee Machine', icon: Coffee },
    { name: 'Parking', icon: Car },
    { name: 'Gaming Setup', icon: Gamepad2 }
  ];

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, minCapacity, selectedFacilities, selectedDate]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedDate) {
        response = await roomService.getAvailableRooms(selectedDate);
      } else {
        response = await roomService.getAllRooms();
      }
      
      if (response.success && response.data) {
        setRooms(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      setError(error.message);
      showToast('Failed to load rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    // Search by name or location
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by capacity
    if (minCapacity) {
      filtered = filtered.filter(room => room.capacity >= parseInt(minCapacity));
    }

    // Filter by facilities
    if (selectedFacilities.length > 0) {
      filtered = filtered.filter(room =>
        selectedFacilities.every(facility =>
          room.facilities?.includes(facility)
        )
      );
    }

    setFilteredRooms(filtered);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      loadAvailableRooms(date);
    } else {
      loadRooms();
    }
  };

  const loadAvailableRooms = async (date) => {
    try {
      setLoading(true);
      const response = await roomService.getAvailableRooms(date);
      if (response.success && response.data) {
        setRooms(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error loading available rooms:', error);
      showToast('Failed to load available rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFacility = (facility) => {
    setSelectedFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setMinCapacity('');
    setSelectedFacilities([]);
    setSelectedDate('');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleAddRoom = async (roomData) => {
    try {
      setAddingRoom(true);
      const response = await roomService.createRoom(roomData);
      
      if (response.success) {
        showToast('Room created successfully!', 'success');
        setShowAddModal(false);
        // Refresh the rooms list
        await loadRooms();
      } else {
        throw new Error(response.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      showToast(error.message || 'Failed to create room', 'error');
    } finally {
      setAddingRoom(false);
    }
  };

  const getFacilityIcon = (facilityName) => {
    const facility = facilitiesOptions.find(f => f.name === facilityName);
    return facility ? facility.icon : Monitor;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
            <p className="text-gray-600">
              View and manage conference rooms and their availability
            </p>
          </div>
          <div className="flex space-x-3">
            {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.LIBRARIAN) && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Room</span>
              </Button>
            )}
            <Button
              onClick={loadRooms}
              className="flex items-center space-x-2"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="date"
                placeholder="Select date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Capacity filter */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                placeholder="Min capacity"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
                className="pl-10"
                min="1"
              />
            </div>

            {/* Clear filters */}
            <Button
              onClick={clearFilters}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>

          {/* Facilities filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Filter by Facilities</h4>
            <div className="flex flex-wrap gap-2">
              {facilitiesOptions.map((facility) => {
                const IconComponent = facility.icon;
                const isSelected = selectedFacilities.includes(facility.name);
                return (
                  <button
                    key={facility.name}
                    onClick={() => toggleFacility(facility.name)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                      ${isSelected
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{facility.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {selectedDate ? 'Available rooms' : 'All rooms'}: {filteredRooms.length} found
          {selectedDate && (
            <span className="ml-2 text-teal-600 font-medium">
              for {formatDate(selectedDate)}
            </span>
          )}
        </p>
      </div>

      {/* Rooms Grid */}
      {error ? (
        <Card className="p-12 text-center bg-gradient-to-br from-red-50 to-rose-100 border border-red-200">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-3">
              Error loading rooms
            </h3>
            <p className="text-red-700 mb-6 leading-relaxed bg-red-50 p-4 rounded-lg border border-red-200">
              {error}
            </p>
            <Button 
              onClick={loadRooms} 
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </Card>
      ) : filteredRooms.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No rooms found
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {searchTerm || minCapacity || selectedFacilities.length > 0 || selectedDate
                ? 'Try adjusting your filters or search criteria to find available rooms'
                : 'No rooms are currently available in the system'
              }
            </p>
            {(searchTerm || minCapacity || selectedFacilities.length > 0 || selectedDate) && (
              <Button 
                onClick={clearFilters}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white">
              <div className="p-6">
                {/* Room Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {room.name}
                    </h3>
                    <span className={`
                      px-3 py-1 text-xs font-semibold rounded-full shadow-sm
                      ${room.isActive
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }
                    `}>
                      {room.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    <MapPin className="w-4 h-4 mr-2 text-teal-600" />
                    <span className="font-medium">{room.location || 'Location not specified'}</span>
                  </div>
                </div>

                {/* Room Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between bg-teal-50 px-4 py-3 rounded-lg border border-teal-100">
                    <div className="flex items-center text-teal-700">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="text-sm font-semibold">Capacity</span>
                    </div>
                    <span className="text-lg font-bold text-teal-800">{room.capacity} people</span>
                  </div>

                  {room.description && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                        {room.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Facilities */}
                {room.facilities && room.facilities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                      <Monitor className="w-4 h-4 mr-2 text-teal-600" />
                      Facilities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {room.facilities.map((facility, index) => {
                        const IconComponent = getFacilityIcon(facility);
                        return (
                          <div
                            key={index}
                            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-teal-50 to-blue-50 text-teal-700 rounded-lg text-xs font-medium border border-teal-200 shadow-sm"
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{facility}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700 hover:text-teal-800 font-medium transition-all duration-200"
                      onClick={() => window.open(`/bookings/new?roomId=${room.id}`, '_self')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Room
                    </Button>
                    {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.LIBRARIAN) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-800 font-medium transition-all duration-200"
                        onClick={() => console.log('View details for room:', room.id)}
                      >
                        Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRoom}
        loading={addingRoom}
      />
    </div>
  );
};

export default Rooms;