import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { addDays, endOfWeek, format, isSameDay, isWithinInterval, startOfWeek } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import DatePicker from "@/components/molecules/DatePicker";
import { schoolCalendarService } from "@/services/api/schoolCalendarService";

const CalendarSetup = () => {
  const [calendar, setCalendar] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    academicYear: '',
    startDate: null,
    endDate: null,
    holidays: [],
    breaks: []
  })
  const [newHoliday, setNewHoliday] = useState({ name: '', date: null })
  const [newBreak, setNewBreak] = useState({ name: '', startDate: null, endDate: null })

  const loadCalendar = async () => {
    setLoading(true)
    setError('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const data = await schoolCalendarService.getAll()
      const currentCalendar = data.length > 0 ? data[0] : null
      setCalendar(currentCalendar)
      
      if (currentCalendar) {
        setFormData({
          academicYear: currentCalendar.academicYear,
          startDate: new Date(currentCalendar.startDate),
          endDate: new Date(currentCalendar.endDate),
          holidays: currentCalendar.holidays || [],
          breaks: currentCalendar.breaks || []
        })
      }
    } catch (err) {
      setError('Failed to load calendar settings')
      console.error('Error loading calendar:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCalendar()
  }, [])

  const handleSave = async () => {
    if (!formData.academicYear || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const calendarData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString()
      }

      if (calendar) {
        await schoolCalendarService.update(calendar.Id, calendarData)
        toast.success('Calendar settings updated successfully')
      } else {
        await schoolCalendarService.create(calendarData)
        toast.success('Calendar settings created successfully')
      }
      
      setIsEditing(false)
      loadCalendar()
    } catch (err) {
      toast.error('Failed to save calendar settings')
      console.error('Error saving calendar:', err)
    }
  }

  const addHoliday = () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast.error('Please enter holiday name and date')
      return
    }

    const holiday = {
      name: newHoliday.name,
      date: newHoliday.date.toISOString()
    }

    setFormData(prev => ({
      ...prev,
      holidays: [...prev.holidays, holiday]
    }))

    setNewHoliday({ name: '', date: null })
  }

  const removeHoliday = (index) => {
    setFormData(prev => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== index)
    }))
  }

  const addBreak = () => {
    if (!newBreak.name || !newBreak.startDate || !newBreak.endDate) {
      toast.error('Please enter break name and dates')
      return
    }

    const breakPeriod = {
      name: newBreak.name,
      startDate: newBreak.startDate.toISOString(),
      endDate: newBreak.endDate.toISOString()
    }

    setFormData(prev => ({
      ...prev,
      breaks: [...prev.breaks, breakPeriod]
    }))

    setNewBreak({ name: '', startDate: null, endDate: null })
  }

  const removeBreak = (index) => {
    setFormData(prev => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return <Loading type="calendar" />
  }

  if (error) {
    return <Error message={error} onRetry={loadCalendar} type="network" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Academic Calendar</h2>
        {!isEditing && (
          <Button
            variant="primary"
            icon="Edit"
            onClick={() => setIsEditing(true)}
          >
            Edit Calendar
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Academic Year"
                value={formData.academicYear}
                onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                placeholder="2024-2025"
              />
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Holidays</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Holiday Name"
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Christmas Day"
                  />
                  <DatePicker
                    label="Date"
                    value={newHoliday.date}
                    onChange={(date) => setNewHoliday(prev => ({ ...prev, date }))}
                  />
                  <div className="flex items-end">
                    <Button
                      variant="secondary"
                      icon="Plus"
                      onClick={addHoliday}
                      className="w-full"
                    >
                      Add Holiday
                    </Button>
                  </div>
                </div>

                {formData.holidays.length > 0 && (
                  <div className="space-y-2">
                    {formData.holidays.map((holiday, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{holiday.name}</span>
                          <span className="text-gray-500 ml-2">
                            {format(new Date(holiday.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="X"
                          onClick={() => removeHoliday(index)}
                          className="text-error-600 hover:text-error-700"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Breaks</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    label="Break Name"
                    value={newBreak.name}
                    onChange={(e) => setNewBreak(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Spring Break"
                  />
                  <DatePicker
                    label="Start Date"
                    value={newBreak.startDate}
                    onChange={(date) => setNewBreak(prev => ({ ...prev, startDate: date }))}
                  />
                  <DatePicker
                    label="End Date"
                    value={newBreak.endDate}
                    onChange={(date) => setNewBreak(prev => ({ ...prev, endDate: date }))}
                  />
                  <div className="flex items-end">
                    <Button
                      variant="secondary"
                      icon="Plus"
                      onClick={addBreak}
                      className="w-full"
                    >
                      Add Break
                    </Button>
                  </div>
                </div>

                {formData.breaks.length > 0 && (
                  <div className="space-y-2">
                    {formData.breaks.map((breakPeriod, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{breakPeriod.name}</span>
                          <span className="text-gray-500 ml-2">
                            {format(new Date(breakPeriod.startDate), 'MMM d')} - {format(new Date(breakPeriod.endDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="X"
                          onClick={() => removeBreak(index)}
                          className="text-error-600 hover:text-error-700"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
              >
                Save Calendar
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          {calendar ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Year</h3>
                  <p className="text-2xl font-bold text-primary-600">{calendar.academicYear}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Date</h3>
                  <p className="text-lg text-gray-700">{format(new Date(calendar.startDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">End Date</h3>
                  <p className="text-lg text-gray-700">{format(new Date(calendar.endDate), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Holidays ({calendar.holidays?.length || 0})</h3>
                  <div className="space-y-2">
                    {calendar.holidays?.map((holiday, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ApperIcon name="Calendar" size={16} className="text-success-600" />
                          <span className="font-medium">{holiday.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(holiday.date), 'MMM d')}
                        </span>
                      </div>
                    ))}
                    {(!calendar.holidays || calendar.holidays.length === 0) && (
                      <p className="text-gray-500 text-sm">No holidays configured</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Breaks ({calendar.breaks?.length || 0})</h3>
                  <div className="space-y-2">
                    {calendar.breaks?.map((breakPeriod, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ApperIcon name="Coffee" size={16} className="text-primary-600" />
                          <span className="font-medium">{breakPeriod.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(breakPeriod.startDate), 'MMM d')} - {format(new Date(breakPeriod.endDate), 'MMM d')}
                        </span>
                      </div>
                    ))}
                    {(!calendar.breaks || calendar.breaks.length === 0) && (
                      <p className="text-gray-500 text-sm">No breaks configured</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Calendar" size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Calendar Configured</h3>
              <p className="text-gray-600 mb-4">Set up your academic calendar to enable date replacement in lesson plans.</p>
              <Button
                variant="primary"
                icon="Plus"
                onClick={() => setIsEditing(true)}
              >
                Create Calendar
              </Button>
</div>
          )}
        </Card>
      )}

      {/* Date Range Picker Demo Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Date Selection</h3>
        <p className="text-gray-600 mb-6">
          Experience our new date range picker with multiple selection modes for advanced calendar planning.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <DatePicker
              label="Single Date Selection"
              mode="single"
              showCalendar={true}
              placeholder="Pick a single date"
              onChange={(date) => console.log('Single date:', date)}
            />
          </div>
          
          <div>
            <DatePicker
              label="Multiple Dates Selection"
              mode="multiple"
              showCalendar={true}
              placeholder="Pick multiple dates"
              onChange={(dates) => console.log('Multiple dates:', dates)}
            />
          </div>
          
          <div>
            <DatePicker
              label="Date Range Selection"
              mode="range"
              showCalendar={true}
              placeholder="Pick a date range"
              onChange={(range) => console.log('Date range:', range)}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" size={16} className="text-primary-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-primary-900 mb-1">How to use the enhanced date picker:</h4>
              <ul className="text-sm text-primary-700 space-y-1">
                <li><strong>Single mode:</strong> Click any date to select it</li>
                <li><strong>Multiple mode:</strong> Click dates to add/remove from selection</li>
                <li><strong>Range mode:</strong> Click start date, then end date to create a range</li>
              </ul>
            </div>
</div>
          </div>
        </div>
      </Card>
    </div>
  )

export default CalendarSetup